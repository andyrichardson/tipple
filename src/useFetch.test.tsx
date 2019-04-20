jest.mock('./util', () => ({
  getKey: jest.fn(),
  executeRequest: jest.fn(),
}));
import React, { FC } from 'react';
import renderer from 'react-test-renderer';
import { useFetch, FetchState, GeneralUseFetchOptions } from './useFetch';
import { TippleContext } from './context';
import { getKey, executeRequest } from './util';

// Setup util mocks
const key = '12345';
const response = 'value';
(getKey as jest.Mock).mockReturnValue(key);
(executeRequest as jest.Mock).mockReturnValue(Promise.resolve(response));

// Provider mocks
let config: any = {
  baseUrl: 'http://url',
  headers: { 'content-type': 'application/json' },
};
let responses: any = { '12345': [1, 2, 3] };
let domains: any = {};
let addResponse = jest.fn();
let clearDomains = jest.fn();

// Hook options
let url: string = '/users';
let opts: Parameters<typeof useFetch>[1] = { domains: ['any'] };

// Hook results
let state: FetchState;
let refetch: () => void;

const HookFixture: FC = () => {
  const [a, b] = useFetch(url, opts);

  state = a;
  refetch = b;

  return null;
};

const Fixture: FC = props => (
  <TippleContext.Provider
    value={{ config, responses, domains, addResponse, clearDomains }}
  >
    <HookFixture />
  </TippleContext.Provider>
);

const waitForAsync = (delay = 20) =>
  new Promise(resolve => setTimeout(resolve, delay));

beforeEach(() => {
  config = {
    baseUrl: 'http://url',
    headers: { 'content-type': 'application/json' },
  };
  responses = { '12345': [1, 2, 3] };
  domains = {};
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
      ...opts.fetchOptions,
      headers: config.headers,
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
    responses[key] = undefined;
    instance.update(<Fixture />);
    expect(executeRequest).toBeCalledTimes(2);
  });
});

describe('on cache change', () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(() => {
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('updates data value', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    responses[key] = 'new value';
    instance.update(<Fixture />);
    await waitForAsync();
    expect(state.data).toEqual(responses[key]);
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
    expect(state.data).toBe(responses[key]);
  });

  it('does not call executeRequest on mount', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    expect(executeRequest).toBeCalledTimes(0);
  });

  it('does not call executeRequest on data invalidation', async () => {
    instance.update(<Fixture />);
    await waitForAsync();
    responses = {};
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
    responses[key] = 'new value';
    instance.update(<Fixture />);
    await waitForAsync();
    expect(state.data).toEqual(response);
  });
});
