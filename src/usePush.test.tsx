jest.mock('./util', () => ({
  getKey: jest.fn(),
  executeRequest: jest.fn(),
}));
import React, { FC } from 'react';
import renderer, { act } from 'react-test-renderer';
import { TippleContext } from './context';
import { FetchState } from './types';
import { usePush } from './usePush';
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

let domains: any = {};
let clearDomains = jest.fn();

// Hook options
let url: string = '/users';
let opts: Parameters<typeof usePush>[1] = { domains: ['users'] };

// Hook results
let state: FetchState;
let doFetch: () => Promise<any>;
let reset: () => void;

const HookFixture: FC = () => {
  const [a, b, c] = usePush(url, opts);

  state = a;
  doFetch = b;
  reset = c;

  return null;
};

const Fixture: FC = props => (
  // @ts-ignore
  <TippleContext.Provider value={{ config, domains, clearDomains }}>
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

  it('defaults to not fetching', () => {
    expect(state.fetching).toBe(false);
  });
});

describe('on doFetch', () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(() => {
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('sets fetching to true', async () => {
    doFetch();
    expect(state.fetching).toBe(true);
  });

  it('calls executeRequest with url and options', () => {
    doFetch();
    expect(executeRequest).toBeCalledWith(`${config.baseUrl}${url}`, {
      headers: config.headers,
    });
  });

  it('calls clearDomains on response', async () => {
    doFetch();
    await waitForAsync();
    expect(clearDomains).toBeCalledWith(opts.domains);
  });
});

describe('on response', () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(() => {
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('sets data value', async () => {
    doFetch();
    await waitForAsync();
    expect(state.data).toBe(response);
  });

  it('sets data value', async () => {
    expect(await doFetch()).toEqual(response);
  });

  it('clears data', async () => {
    doFetch();
    await waitForAsync();
    act(() => reset());
    expect(state.data).toBe(undefined);
  });
});

describe('on error', () => {
  let instance: renderer.ReactTestRenderer;

  beforeEach(async () => {
    (executeRequest as jest.Mock).mockReturnValueOnce(Promise.reject(Error()));
    instance = renderer.create(<Fixture />);
  });

  afterEach(() => instance.unmount());

  it('sets error value', async () => {
    await doFetch().catch(() => false);
    expect((state.error as any).constructor).toBe(Error);
  });

  it('throws async error', async () => {
    try {
      await doFetch();
      fail();
    } catch (err) {
      expect(err instanceof Error).toBe(true);
    }
  });

  it('does not call clearDomains', () => {
    expect(clearDomains).toBeCalledTimes(0);
  });

  it('clears error', () => {
    act(() => reset());
    expect(state.error).toBe(undefined);
  });
});
