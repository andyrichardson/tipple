jest.mock('./util', () => ({
  getKey: jest.fn(),
  executeRequest: jest.fn(),
  mergeFetchOptions: jest.requireActual('./util').mergeFetchOptions,
}));
import React, { FC } from 'react';
import renderer from 'react-test-renderer';
import { useFetch } from './useFetch';
import { TippleContext } from './context';
import { getKey, executeRequest } from './util';
import { FetchState, GeneralUseFetchOptions } from './types';

// Setup util mocks
const key = '12345';
const response = 'value';
(getKey as jest.Mock).mockReturnValue(key);
(executeRequest as jest.Mock).mockReturnValue(Promise.resolve(response));

// Provider mocks
let config: any = {
  baseUrl: 'http://url',
  fetchOptions: { headers: { 'content-type': 'application/json' } },
};
let addResponse = jest.fn();
let cache: any = { '12345': { data: [1, 2, 3], refetch: false } };

// Hook options
let url: string = '/users';
let opts: Parameters<typeof useFetch>[1] = { domains: ['any'] };

// Hook results
let state: FetchState;
let manualFetch: (args?: any) => void;

const HookFixture: FC = () => {
  const [a, b] = useFetch(url, opts);

  state = a;
  manualFetch = b;

  return null;
};

const Fixture: FC = () => (
  // @ts-ignore
  <TippleContext.Provider value={{ config, cache, addResponse }}>
    <HookFixture />
  </TippleContext.Provider>
);

const waitForAsync = (delay = 100) =>
  new Promise(resolve => setTimeout(resolve, delay));

beforeEach(() => {
  config = {
    baseUrl: 'http://url',
    headers: { 'content-type': 'application/json' },
  };
  url = '/users';
  opts = { domains: ['any'] };
});

beforeEach(jest.clearAllMocks);

describe('on init', () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(() => {
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('defaults to fetching', () => {
    expect(state.fetching).toBe(true);
  });

  it('calls executeRequest', async () => {
    instance.update(<Fixture />);
    expect(executeRequest).toBeCalledTimes(1);
  });

  it('calls executeRequest with url and opts', async () => {
    instance.update(<Fixture />);
    expect(executeRequest).toBeCalledWith(`${config.baseUrl}${url}`, {
      method: 'GET',
      ...config.fetchOptions,
      ...opts.fetchOptions,
    });
  });

  describe('onMount disabled', () => {
    beforeEach(() => ((opts as GeneralUseFetchOptions).onMount = false));

    it('defaults to not fetching', () => {
      expect(state.fetching).toBe(true);
    });

    it("doesn't call executeRequest", async () => {
      instance.update(<Fixture />);
      expect(executeRequest).toBeCalledTimes(0);
    });
  });

  describe('baseUrl set', () => {
    beforeEach(() => {
      opts.baseUrl = 'http://exampleBaseUrl';
    });

    it('calls executeRequest with baseUrl override', () => {
      instance.update(<Fixture />);
      expect(executeRequest).toBeCalledWith(`${opts.baseUrl}${url}`, {
        method: 'GET',
        ...config.fetchOptions,
        ...opts.fetchOptions,
      });
    });
  });

  describe('addResponse', () => {
    it('is called', async () => {
      instance.update(<Fixture />);
      await waitForAsync();
      expect(addResponse).toBeCalledTimes(1);
    });

    it('is passed args', async () => {
      instance.update(<Fixture />);
      await waitForAsync();
      expect(addResponse).toBeCalledWith({
        data: response,
        key: key,
        domains: (opts as GeneralUseFetchOptions).domains,
      });
    });
  });
});

describe("on manual fetch", () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(() => {
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('calls executeRequest', () => {
    manualFetch();
    expect(executeRequest).toBeCalledWith(`${config.baseUrl}${url}`, {
      method: 'GET',
      ...config.fetchOptions,
      ...opts.fetchOptions,
    });
  });

  it('calls executeRequest with override options', () => {
    const override = { baseUrl: 'http://override', fetchOptions: { headers: { 'some-header': 'somevalue' } }};
    manualFetch(override);
    expect(executeRequest).toBeCalledWith(`${override.baseUrl}${url}`, {
      method: 'GET',
      ...config.fetchOptions,
      ...override.fetchOptions,
    });
  });
})

describe('on fetched', () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(() => {
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('sets fetching to false', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    expect(state.fetching).toBe(false);
  });

  it('returns cached data', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    expect(state.data).toEqual(response);
  });

  describe('parseResponse', () => {
    const parseResponse = jest.fn().mockReturnValue('sample value');

    beforeEach(() => {
      opts.parseResponse = parseResponse;
    });

    it('is called', async () => {
      instance.update(<Fixture />);
      await waitForAsync();
      expect(parseResponse).toBeCalledTimes(1);
    });

    it('returns data value', async () => {
      instance.update(<Fixture />);
      await waitForAsync();
      expect(state.data).toEqual(parseResponse());
    });
  });
});

describe('on error', () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(() => {
    (executeRequest as jest.Mock).mockReturnValueOnce(Promise.reject(Error()));
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('sets fetching to false', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    expect(state.fetching).toBe(false);
  });

  it('returns error value', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    // @ts-ignore
    expect(state.error.constructor).toBe(Error);
  });
});

describe('on invalidation', () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(() => {
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('calls executeRequest again', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    cache[key] = { ...cache[key], refetch: true };
    instance.update(<Fixture />);
    expect(executeRequest).toBeCalledTimes(2);
  });
});

describe.skip('on cache change', () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(() => {
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('updates data value', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    cache[key] = { data: 'new value', refetch: false };
    instance.update(<Fixture />);
    await waitForAsync();
    expect(state.data).toEqual(cache[key].data);
  });
});

describe('cache-only', () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(() => {
    opts = { domains: ['example'], cachePolicy: 'cache-only' };
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('defaults to not fetching', () => {
    expect(state.fetching).toBe(false);
  });

  it('returns value from cache', () => {
    expect(state.data).toBe(cache[key].data);
  });

  it('does not call executeRequest on mount', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    expect(executeRequest).toBeCalledTimes(0);
  });

  it('does not call executeRequest on data invalidation', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    cache = {};
    instance.update(<Fixture />);
    await waitForAsync();
    expect(executeRequest).toBeCalledTimes(0);
  });
});

describe('network only', () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(() => {
    opts = { cachePolicy: 'network-only' };
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('defaults to fetching', () => {
    expect(state.fetching).toBe(true);
  });

  it('calls executeRequest on mount', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    expect(executeRequest).toBeCalledTimes(1);
  });

  it('returns value from response', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    expect(state.data).toBe(response);
  });

  it('ignores changes to cache', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    cache[key] = { data: 'new value' };
    instance.update(<Fixture />);
    await waitForAsync();
    expect(state.data).toEqual(response);
  });
});
