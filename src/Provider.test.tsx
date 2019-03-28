import React, { useContext, FC } from 'react';
import renderer, { act } from 'react-test-renderer';
import { TippleContext } from './context';
import { createAddResponse, createClearDomains, Provider } from './Provider';

const domains = {
  users: ['key1', 'key2', 'key3'],
  posts: ['key1', 'key2', 'key4'],
  comments: ['key2'],
};

const responses = {
  key1: { data: 'example1' },
  key2: { data: 'example2' },
  key3: { data: 'example3' },
  key4: { data: 'example4' },
};

const setDomains = jest.fn();
const setResponses = jest.fn();

beforeEach(jest.clearAllMocks);

describe('createAddResponse', () => {
  const key = 'key5';
  const domainsArr = ['users', 'posts'];
  const data = { data: 'example5' };

  it('adds key to associated domains', () => {
    const fn = createAddResponse(domains, responses, setDomains, setResponses);
    fn({ key, domains: domainsArr, data });

    expect(setDomains).toBeCalledWith({
      ...domains,
      users: [...domains.users, key],
      posts: [...domains.posts, key],
    });
  });

  it('adds response to collection of responses', () => {
    const fn = createAddResponse(domains, responses, setDomains, setResponses);
    fn({ key, domains: domainsArr, data });

    expect(setResponses).toBeCalledWith({ ...responses, [key]: data });
  });
});

describe('createClearDomains', () => {
  it('sets responses as undefined for provided domains', () => {
    const fn = createClearDomains(domains, responses, setResponses);
    fn(['comments']);

    expect(setResponses).toBeCalledWith({ ...responses, key2: undefined });
  });
});

let context: TippleContext;

const ChildComponent: FC = () => {
  context = useContext(TippleContext);
  return null;
};

describe('provider', () => {
  const config = {
    baseUrl: 'http://example',
    headers: { 'content-type': 'application/json' },
  };

  beforeEach(() => {
    renderer.create(
      <Provider baseUrl={config.baseUrl} headers={config.headers}>
        <ChildComponent />
      </Provider>
    );
  });

  it('provides config', () => {
    expect(context.config).toEqual(config);
  });

  describe('on add response', () => {
    const args = {
      key: '1234',
      data: ['my data'],
      domains: ['domain1', 'domain2'],
    };

    it('context domains are updated', () => {
      act(() => context.addResponse(args));

      expect(context.domains).toEqual({
        [args.domains[0]]: [args.key],
        [args.domains[1]]: [args.key],
      });
    });

    it('context responses are updated', () => {
      act(() => context.addResponse(args));

      expect(context.responses).toEqual({ [args.key]: args.data });
    });
  });

  describe('on clear domains', () => {
    const args1 = { key: '1234', data: ['data1'], domains: ['domain1'] };
    const args2 = { key: '5678', data: ['data2'], domains: ['domain2'] };
    const args3 = {
      key: '9876',
      data: ['data3'],
      domains: ['domain3', 'domain1'],
    };

    beforeEach(() => {
      act(() => context.addResponse(args1));
      act(() => context.addResponse(args2));
      act(() => context.addResponse(args3));
    });

    it('clears responses in domain', () => {
      act(() => context.clearDomains(['domain1']));
      expect(context.responses).toEqual({ [args2.key]: args2.data });
    });
  });
});
