import { getKey, mergeFetchOptions } from './util';

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

describe('mergeFetchOptions', () => {
  const contextOptions = {
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  };
  const clientOptions = {
    headers: { 'content-type': 'plain' },
    method: 'PUT',
  };

  it('overrides root level options', () => {
    expect(mergeFetchOptions(contextOptions, clientOptions)).toHaveProperty(
      'method',
      clientOptions.method
    );
  });

  it('overrides headers', () => {
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
