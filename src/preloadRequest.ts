import {
  useMemo,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useState,
} from 'react';
import { TippleClient } from './client';
import { TippleContext } from './context';
import { getKey, mergeFetchOptions } from './util';
import {
  GeneralFetchOptions,
  NetworkOnlyOption,
  CacheOnlyOption,
} from './types';

/** Preload request for use with suspense. */
export const preloadFetch = <T, D extends string = string>(
  client: TippleClient<D>,
  ...opts: Parameters<TippleClient<D>['executeRequest']>
) => {
  const request = client.executeRequest(...opts);
  const p = wrapPromise(client.executeRequest(...opts));

  return {
    meta: {
      url: opts[0],
      request,
      ...opts[1],
    },
    get data(): T {
      return p.read();
    },
  };
};

/** Connect preloaded fetch to the cache. */
export const usePreloadedFetch = <T, D extends string = string>(
  pre: PreloadedFetch<T>,
  opts: UsePreloadedFetchOptions<D, T>
) => {
  const fetchResolved = useRef(false);
  const [accessors, setAccessors] = useState<{ data: T }>(pre);
  const { cache, addResponse, executeRequest } = useContext(TippleContext);

  /** Unique identifier of request. */
  const key = useMemo(() => getKey(pre.meta.url, pre.meta.fetchOptions || {}), [
    pre.meta,
  ]);

  const cacheState = useMemo(
    () => cache[key] || { refetch: false, data: undefined },
    [cache[key]] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    pre.meta.request.then(data => {
      addResponse({
        data,
        key,
        domains: opts.domains,
      });
      fetchResolved.current = true;
    });
  }, [pre.meta, key]);

  const doFetch = useCallback(async () => {
    const data = await executeRequest<T>(pre.meta.url, {
      baseUrl: pre.meta.baseUrl,
      fetchOptions: pre.meta.fetchOptions,
    });

    setAccessors({
      data,
    });
  }, []);

  /** Data change in cache. */
  useEffect(() => {
    // Data from cache is unchanged
    if (
      !fetchResolved.current ||
      cacheState.data === undefined ||
      JSON.stringify(accessors.data) === JSON.stringify(cacheState.data)
    ) {
      return;
    }

    if (opts.cachePolicy === 'network-only') {
      return;
    }

    setAccessors({
      data: cacheState.data,
    });
  }, [fetchResolved.current, opts.cachePolicy, cacheState.data]);

  /** On cache invalidation. */
  useEffect(() => {
    if (
      !fetchResolved.current ||
      opts.cachePolicy === 'cache-only' ||
      opts.cachePolicy === 'network-only'
    ) {
      return;
    }

    if (cacheState.refetch) {
      doFetch();
    }
  }, [fetchResolved.current, cacheState, doFetch]);

  return accessors;
};

const wrapPromise = <D>(promise: Promise<D>) => {
  let state: PromiseState = { status: 'pending' };

  const inFlight = promise.then(
    r => {
      state = { status: 'success', response: r };
    },
    err => {
      state = { status: 'error', response: err };
    }
  );

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

interface PreloadedFetch<T> {
  meta: {
    url: string;
    baseUrl?: string;
    fetchOptions?: RequestInit;
    request: Promise<T>;
  };
  data: T;
}

export interface BasePreloadFetchOptions<D extends string = string, T = any> {
  domains: D[];
  autoFetch?: boolean;
}

/** Default useFetch options. */
type GeneralUsePreloadedFetchOptions<D extends string, T> = GeneralFetchOptions<
  BasePreloadFetchOptions<D, T>
>;
/** useFetch options without domain (for network-only). */
type NetworkOnlyUseFetchOptions<T> = NetworkOnlyOption<
  BasePreloadFetchOptions<never, T>
>;
/** useFetch options without autoFetch option (for cache-only). */
type CacheOnlyUseFetchOptions<D extends string, T> = CacheOnlyOption<
  BasePreloadFetchOptions<D, T>
>;

type UsePreloadedFetchOptions<
  D extends string,
  T
> = GeneralUsePreloadedFetchOptions<D, T> &
  NetworkOnlyUseFetchOptions<T> &
  CacheOnlyUseFetchOptions<D, T>;
