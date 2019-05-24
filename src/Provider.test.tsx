import React, { useContext } from 'react';
import renderer from 'react-test-renderer';
import { mocked } from 'ts-jest/utils';
import { TippleContext } from './context';
import { Provider } from './Provider';
import { TippleClient } from './client';

let client = ({
  addCacheWatcher: jest.fn(),
} as unknown) as TippleClient;

let contextState: any;

const Fixture = () => {
  const Child = () => {
    contextState = useContext(TippleContext);
    return null;
  };

  return (
    <Provider client={client}>
      <Child />
    </Provider>
  );
};

beforeEach(jest.clearAllMocks);

describe('on mount', () => {
  it('calls addCacheWatcher', () => {
    const instance = renderer.create(<Fixture />);
    instance.update(<Fixture />);
    expect(client.addCacheWatcher).toBeCalledTimes(1);
  });
});

describe('on cache update', () => {
  it('forwards cache to child', () => {
    const cache = { value: 'Myvalue' };
    const instance = renderer.create(<Fixture />);
    instance.update(<Fixture />);
    mocked(client.addCacheWatcher).mock.calls[0][0](cache as any);
    expect(contextState.cache).toEqual(cache);
  });
});
