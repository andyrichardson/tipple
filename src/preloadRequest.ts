import { useMemo } from 'react';

type ResolvedPreload<T> = {
  [K in keyof T]: T[K] extends Promise<infer R> ? R : never;
};

export const usePreloadedFetch = <T>(data: T) => {
  const accessors = useMemo(
    () =>
      Object.entries(data).reduce(
        (p, [key, value]) => {
          const wrappedPromise = wrapPromise(value);

          return {
            ...p,
            get [key]() {
              return wrappedPromise.read();
            },
          };
        },
        {} as ResolvedPreload<T>
      ),
    [data]
  );

  return accessors;
};

const wrapPromise = <D>(promise: Promise<D>) => {
  let state: PromiseState = { status: 'pending' };
  const inFlight = promise
    .then(r => {
      state = { status: 'success', response: r };
    })
    .catch(err => {
      state = { status: 'error', response: err };
    });

  return {
    read: () => {
      if (state.status === 'pending') {
        throw inFlight;
      }

      if (state.status === 'error') {
        throw state.response;
      }

      return state.response;
    },
  };
};

type PromiseState =
  | { status: 'pending' }
  | { status: 'error'; response: any }
  | { status: 'success'; response: any };
