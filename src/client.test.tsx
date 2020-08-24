jest.mock('./util', () => ({
  ...jest.requireActual('./util'),
  executeRequest: jest.fn(),
}));
import { createClient, TippleClient } from './client';
import { mocked } from 'ts-jest/utils';
import { executeRequest } from './util';

const opts = {
  baseUrl: 'http://1234',
  fetchOptions: { headers: { 'content-type': 'application/json' } },
};

const cacheWatcher = jest.fn();

beforeEach(jest.clearAllMocks);

describe('on init', () => {
  let client: TippleClient;
  const config = {
    ...opts,
    initialCache: {
      key: {
        data: { example: 99999 },
        domains: ['domain1', 'domain2'],
        refetch: true,
      },
    },
  };
  const cacheWatcher = jest.fn();

  beforeEach(() => {
    client = createClient(config);
    client.addCacheWatcher(cacheWatcher);
  });

  it('config is forwarded', () => {
    expect(client.config).toEqual(config);
  });

  it('initial cache is used', () => {
    client.clearDomains(['domain1']);
    expect(cacheWatcher).toBeCalledWith(config.initialCache);
  });
});

describe('on addResponse', () => {
  const response = {
    key: '1234',
    data: { example: 'data' },
    domains: ['domain'],
  };
  let client: TippleClient;

  beforeEach(() => {
    client = createClient(opts);
    client.addCacheWatcher(cacheWatcher);
  });

  describe('initial addition', () => {
    it('passes cache to cacheWatcher', () => {
      client.addResponse(response);
      expect(cacheWatcher).toBeCalledTimes(1);
    });

    it('correctly sets cache state', () => {
      client.addResponse(response);
      expect(cacheWatcher).toBeCalledWith({
        [response.key]: {
          data: response.data,
          domains: response.domains,
          refetch: false,
        },
      });
    });
  });

  describe('on further addition', () => {
    const initialResponse = {
      key: '1234',
      data: { example: { data: 1 } },
      domains: ['messages'],
    };

    const response = {
      key: '5678',
      data: { example: 1 },
      domains: ['users'],
    };

    beforeEach(() => {
      client.addResponse(initialResponse);
      cacheWatcher.mockClear();
    });

    it('passes cache to cacheWatcher', () => {
      client.addResponse(response);
      expect(cacheWatcher).toBeCalledTimes(1);
    });

    it('correctly sets cache state', () => {
      client.addResponse(response);
      expect(cacheWatcher).toBeCalledWith({
        [initialResponse.key]: {
          data: initialResponse.data,
          domains: initialResponse.domains,
          refetch: false,
        },
        [response.key]: {
          data: response.data,
          domains: response.domains,
          refetch: false,
        },
      });
    });
  });

  describe('on replacement', () => {
    const initialResponse = {
      key: '1234',
      data: { example: { data: 1 } },
      domains: ['messages'],
    };

    const response = {
      key: '1234',
      data: { example: 1 },
      domains: ['users'],
    };

    beforeEach(() => {
      client.addResponse(initialResponse);
      cacheWatcher.mockClear();
    });

    it('passes cache to cacheWatcher', () => {
      client.addResponse(response);
      expect(cacheWatcher).toBeCalledTimes(1);
    });

    it('correctly sets cache state', () => {
      client.addResponse(response);
      expect(cacheWatcher).toBeCalledWith({
        [response.key]: {
          data: response.data,
          domains: response.domains,
          refetch: false,
        },
      });
    });
  });
});

describe('on clearDomains', () => {
  const response1 = {
    key: '1234',
    data: { example: 'data' },
    domains: ['domain1'],
  };
  const response2 = {
    key: '1111',
    data: { example: 99999 },
    domains: ['domain1', 'domain2'],
  };
  const response3 = {
    key: '9292',
    data: { example: 'hello world' },
    domains: ['domain4', 'domain2'],
  };

  let client: TippleClient;

  beforeEach(() => {
    client = createClient(opts);
    client.addCacheWatcher(cacheWatcher);
    client.addResponse(response1);
    client.addResponse(response2);
    client.addResponse(response3);
    cacheWatcher.mockClear();
  });

  it('passes cache to cacheWatcher', () => {
    client.clearDomains(response1.domains);
    expect(cacheWatcher).toBeCalledTimes(1);
  });

  describe('on single domain invalidation', () => {
    it('sets dependencies to refetching', () => {
      client.clearDomains(['domain2']);
      expect(cacheWatcher).toBeCalledWith({
        [response1.key]: {
          data: response1.data,
          domains: response1.domains,
          refetch: false,
        },
        [response2.key]: {
          data: response2.data,
          domains: response2.domains,
          refetch: true,
        },
        [response3.key]: {
          data: response3.data,
          domains: response3.domains,
          refetch: true,
        },
      });
    });
  });

  describe('on multi domain invalidation', () => {
    it('sets dependencies to refetching', () => {
      client.clearDomains(['domain2', 'domain4']);
      expect(cacheWatcher).toBeCalledWith({
        [response1.key]: {
          data: response1.data,
          domains: response1.domains,
          refetch: false,
        },
        [response2.key]: {
          data: response2.data,
          domains: response2.domains,
          refetch: true,
        },
        [response3.key]: {
          data: response3.data,
          domains: response3.domains,
          refetch: true,
        },
      });
    });
  });
});

describe('on executeRequest', () => {
  const url = '/test';
  const executeRequestMock = mocked(executeRequest);
  let client: TippleClient;
  const config = {
    ...opts,
  };

  beforeEach(() => {
    client = createClient(config);
  });

  it('calls util', () => {
    client.executeRequest(url);
    expect(executeRequestMock).toBeCalledTimes(1);
  });

  describe('on no additional options', () => {
    beforeEach(() => {
      client.executeRequest(url);
    });

    it('calls util with default args', () => {
      expect(executeRequestMock).toBeCalledWith(
        `${config.baseUrl}${url}`,
        config.fetchOptions
      );
    });
  });

  describe('on additional  options', () => {
    const mergeOpts = {
      baseUrl: 'http://newurl/',
      fetchOptions: { method: 'POST' },
    };

    beforeEach(() => {
      client.executeRequest(url, mergeOpts);
    });

    it('calls util with config overrides', () => {
      expect(executeRequestMock).toBeCalledWith(`${mergeOpts.baseUrl}${url}`, {
        ...config.fetchOptions,
        ...mergeOpts.fetchOptions,
      });
    });
  });
});
