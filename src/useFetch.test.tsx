jest.mock('react', () => {
  const addResponse = jest.fn();
  const clearDomains = jest.fn();

  return {
    ...jest.requireActual('react'),
    useContext: () => ({
      config: {
        baseUrl: 'http://example',
        headers: { accept: 'application/json' },
      },
      responses: {},
      addResponse,
      clearDomains,
    }),
  };
});
import React, { useContext } from 'react';
import renderer from 'react-test-renderer';
import { useFetch, FetchState } from './useFetch';

beforeEach(jest.clearAllMocks);

let state: FetchState;
let refetch: () => void;

type params = Parameters<typeof useFetch>;

const Fixture: React.FC<{ url: params[0]; opts: params[1] }> = ({
  url,
  opts,
}) => {
  const [a, b] = useFetch(url, opts);

  state = a;
  refetch = b;

  return null;
};

declare const global: any;
global.fetch = jest.fn().mockResolvedValue([]);

describe('get request', () => {
  describe('on init', () => {
    const url = '/users';
    const opts = { domains: ['1234'], fetchOptions: { method: 'GET' } };
    const domainArgs = {};
    let instance: renderer.ReactTestRenderer;

    beforeEach(() => {
      instance = renderer.create(<Fixture url={url} opts={opts} />);
    });

    afterEach(() => {
      instance.unmount();
    });

    it('defaults to fetching', () => {
      expect(state.fetching).toBe(true);
    });

    it('calls fetch', async () => {
      instance.update(<Fixture url={url} opts={opts} />);
      expect(fetch).toBeCalledTimes(1);
    });

    it('calls fetch with url', async () => {
      instance.update(<Fixture url={url} opts={opts} />);
      expect(fetch).toBeCalledWith(`http://example${url}`, {
        ...opts.fetchOptions,
        headers: {
          accept: 'application/json',
        },
      });
    });
  });
});
