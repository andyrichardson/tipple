import { useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { TippleContext } from './context';
import { executeRequest, getKey } from './util';

export type TypedUseFetch<D extends string> = <T extends any>(
  url: string,
  opts: UseFetchOptions<D>
) => UseFetchResponse<T>;

export type CachePolicy =
  | 'cache-first'
  | 'cache-only'
  | 'network-first'
  | 'network-only';

export interface FetchState<T = any> {
  fetching: boolean;
  data?: T;
  error?: Error;
}

export interface BaseUseFetchOptions {
  onMount?: boolean;
  fetchOptions?: RequestInit;
}

export interface GeneralUseFetchOptions<D extends string = string>
  extends BaseUseFetchOptions {
  domains: D[];
  cachePolicy?: Exclude<CachePolicy, 'network-only'>;
}

interface NetworkOnlyUseFetchOptions extends BaseUseFetchOptions {
  cachePolicy?: 'network-only';
}

interface UseFetchOptions<D extends string = string> {
  domains: D[];
  cachePolicy?: CachePolicy;
  onMount?: boolean;
  fetchOptions?: RequestInit;
}

type UseFetchResponse<T = any> = [FetchState<T>, () => void];

export const useFetch = <T = any, D extends string = string>(
  url: string,
  opts: GeneralUseFetchOptions<D> | NetworkOnlyUseFetchOptions
): UseFetchResponse<T> => {
  const { config, responses, addResponse } = useContext(TippleContext);
  const cachePolicy = useMemo(
    () => (opts.cachePolicy !== undefined ? opts.cachePolicy : 'cache-first'),
    [opts.cachePolicy]
  );
  /** Unique identifier of request. */
  const key = useMemo(() => getKey(url, opts.fetchOptions || {}), [
    url,
    opts.fetchOptions,
  ]);

  const [fetching, setFetching] = useState<boolean>(
    cachePolicy !== 'cache-only'
  );
  const [data, setData] = useState<T | undefined>(responses[key]);
  const [error, setError] = useState<Error | undefined>(undefined);

  const [state, setState] = useState<FetchState<T>>({
    fetching: opts.cachePolicy !== 'cache-only', // Default to fetching on first render.
  });

  /** Data change in cache */
  useEffect(() => {
    // Data from cache is unchanged
    if (
      responses[key] === undefined ||
      JSON.stringify(data) === JSON.stringify(responses[key])
    ) {
      return;
    }

    if (cachePolicy === 'network-only') {
      return;
    }

    // Initial network request is yet to complete
    if (cachePolicy === 'network-first' && data === undefined) {
      return;
    }

    setData(responses[key]);
  }, [data, cachePolicy, responses[key]]);

  /** Executes fetching of data. */
  const doFetch = useCallback(async () => {
    setFetching(true);

    try {
      const response = await executeRequest(`${config.baseUrl || ''}${url}`, {
        ...opts.fetchOptions,
        headers: { ...config.headers, ...(opts.fetchOptions || {}).headers },
      });

      // Sharing with cache
      if (cachePolicy !== 'network-only') {
        addResponse({
          data: response,
          key,
          domains: (opts as BaseUseFetchOptions & GeneralUseFetchOptions<D>)
            .domains,
        });
      }

      setFetching(false);
      setData(response);
    } catch (error) {
      setFetching(false);
      setError(error);
    }
  }, [config.baseUrl, JSON.stringify(opts), url, addResponse]);

  /** On mount. */
  useEffect(() => {
    if (opts.cachePolicy !== 'cache-only') {
      doFetch();
    }
  }, []);

  /** On data change. */
  useEffect(() => {
    if (!fetching && data === undefined && cachePolicy !== 'cache-only') {
      doFetch();
    }
  }, [fetching, data, doFetch]);

  /** On cache invalidation. */
  useEffect(() => {
    if (
      !fetching &&
      data !== undefined &&
      responses[key] === undefined &&
      cachePolicy !== 'cache-only'
    ) {
      doFetch();
    }
  }, [fetching, data, responses[key], cachePolicy, doFetch]);

  return [{ fetching, error, data }, doFetch];
};
