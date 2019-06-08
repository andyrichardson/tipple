import { mocked } from 'ts-jest/utils';
import { getKey, mergeFetchOptions, executeRequest } from './util';

beforeAll(() => Object.defineProperty(global, 'fetch', { value: jest.fn() }));

beforeEach(jest.clearAllMocks);

describe('get key', () => {
  it('matches snapshot', () => {
    const url = 'http://host:port/route';
    const fetchArgs = {
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ test: 1234 }),
    };

    expect(getKey(url, fetchArgs)).toMatchInlineSnapshot(
      `"http://host:port/route+{\\"test\\":1234}"`
    );
  });
});

describe('executeRequest', () => {
  const url = '1234';
  const fetchOptions = { method: 'GET' };
  const response = { data: 'example data' };
  const json = jest.fn();

  beforeEach(() => {
    mocked(fetch as any).mockReturnValue(
      Promise.resolve({
        ok: true,
        json: json.mockReturnValue(Promise.resolve(response)),
      })
    );
  });

  it('calls fetch', async () => {
    await executeRequest(url, fetchOptions);
    expect(fetch).toBeCalledTimes(1);
    expect(fetch).toBeCalledWith(url, fetchOptions);
  });

  describe('on success', () => {
    it('returns success response from fetch', async () => {
      expect(await executeRequest(url, fetchOptions)).toEqual(response);
    });
  });

  describe('on fail', () => {
    it('throws failure response from fetch', () => {
      mocked(fetch as any).mockReturnValueOnce(
        Promise.resolve({ ok: false, json })
      );
      return executeRequest(url, fetchOptions)
        .then(fail)
        .catch(e => expect(e).toEqual(response));
    });
  });

  describe('on multiple GET requests', () => {
    it('dedupes in flight fetch requests', async () => {
      await Promise.all(
        new Array(10).fill(0).map(() => executeRequest(url, fetchOptions))
      );
      expect(fetch).toBeCalledTimes(1);
    });

    it('re-calls fetch requests not in flight', async () => {
      await executeRequest(url, fetchOptions);
      await executeRequest(url, fetchOptions);
      expect(fetch).toBeCalledTimes(2);
    });
  });

  describe('on multiple push requests', () => {
    it("doesn't dedupe in flight requests", async () => {
      const count = 10;
      await Promise.all(
        new Array(count)
          .fill(0)
          .map(() => executeRequest(url, { method: 'POST' }))
      );
      expect(fetch).toBeCalledTimes(count);
    });
  });
});

describe('mergeFetchOptions', () => {
  const contextOptions = {
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  };
  const clientOptions = {
    headers: { 'content-type': 'plain' },
    method: 'PUT',
  };
  const overrideOptions = {
    headers: { 'content-type': "alt" },
    method: "GET",
  }

  describe("hook arg", () => {
    it('replaces root level options', () => {
      expect(mergeFetchOptions(contextOptions, clientOptions)).toHaveProperty(
        'method',
        clientOptions.method
      );
    });
  
    it('replaces headers', () => {
      expect(mergeFetchOptions(contextOptions, clientOptions)).toHaveProperty(
        'headers',
        clientOptions.headers
      );
    });
  
    it('merges headers', () => {
      const altOptions = { headers: { 'some-header': '1234' } };
      expect(mergeFetchOptions(altOptions, clientOptions)).toHaveProperty(
        'headers',
        { ...altOptions.headers, ...clientOptions.headers }
      );
    });
  })

  describe("execute request arg", () => {
    it('replaces root level options', () => {
      expect(mergeFetchOptions(contextOptions, clientOptions, overrideOptions)).toHaveProperty(
        'method',
        overrideOptions.method,
      );
    });
  
    it('replaces headers', () => {
      expect(mergeFetchOptions(contextOptions, clientOptions, overrideOptions)).toHaveProperty(
        'headers',
        overrideOptions.headers
      );
    });
  
    it('merges headers', () => {
      const altOptions = { headers: { 'some-header': '1234' } };
      const additionalOptions = { headers: { 'another-header': 'value' } };
      expect(mergeFetchOptions(altOptions, clientOptions, additionalOptions)).toHaveProperty(
        'headers',
        { ...altOptions.headers, ...clientOptions.headers, ...additionalOptions.headers }
      );
    });
  })

  describe('context function', () => {
    const fn = jest.fn();

    it('is called', () => {
      mergeFetchOptions(fn, clientOptions);
      expect(fn).toBeCalledTimes(1);
    });

    it('is called with clientOptions', () => {
      mergeFetchOptions(fn, clientOptions);
      expect(fn).toBeCalledWith(clientOptions);
    });

    it('value is returned from mergeFetchOptions', () => {
      const val = 1234;
      fn.mockReturnValue(val);
      expect(mergeFetchOptions(fn, clientOptions)).toEqual(val);
    });
  });

  describe('required values', () => {
    it('passes when contextOptions is undefined', () => {
      expect(mergeFetchOptions(undefined, clientOptions)).toEqual(
        clientOptions
      );
    });

    it('passes when clientOptions is undefined', () => {
      expect(mergeFetchOptions(contextOptions, undefined)).toEqual(
        contextOptions
      );
    });

    it('passes when contextOptions + clientOptions is undefined', () => {
      expect(mergeFetchOptions(undefined, undefined)).toEqual({});
    });
  });
});
