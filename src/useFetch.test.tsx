jest.mock('./util', () => ({
  getKey: jest.fn(),
  executeRequest: jest.fn(),
}));
import React, { FC } from 'react';
import renderer from 'react-test-renderer';
import { useFetch, FetchState } from './useFetch';
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
        domains: opts.domains,
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

  it('returns cached data', () => {
    expect(state.data).toEqual(responses[key]);
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
    await waitForAsync();
    expect(executeRequest).toBeCalledTimes(2);
  });
});
