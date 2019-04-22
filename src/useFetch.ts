import { useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { TippleContext } from './context';
import { executeRequest, getKey } from './util';
import { UseFetchOptions, UseFetchResponse } from './types';

export const useFetch = <T = any, D extends string = string>(
  url: string,
  opts: UseFetchOptions<D>
): UseFetchResponse<T> => {
  /** Unique identifier of request. */
  const key = useMemo(() => getKey(url, opts.fetchOptions || {}), [
    url,
    opts.fetchOptions,
  ]);

  const { config, responses, addResponse } = useContext(TippleContext);
  const cacheState = useMemo(
    () => responses[key] || { refetch: false, data: undefined },
    [responses[key]]
  );

  const [fetching, setFetching] = useState<boolean>(
    opts.cachePolicy !== 'cache-only' && opts.onMount !== false
  );
  const [data, setData] = useState<T | undefined>(
    opts.cachePolicy !== 'network-only' && opts.cachePolicy !== 'network-first'
      ? cacheState.data
      : undefined
  );
  const [error, setError] = useState<Error | undefined>(undefined);

  /** Executes fetching of data. */
  const doFetch = useCallback(async () => {
    setFetching(true);

    try {
      const response = await executeRequest(`${config.baseUrl || ''}${url}`, {
        ...opts.fetchOptions,
        headers: { ...config.headers, ...(opts.fetchOptions || {}).headers },
      });

      // Sharing with cache
      if (opts.cachePolicy !== 'network-only') {
        addResponse({
          data: response,
          key,
          domains: opts.domains,
        });
      }

      setFetching(false);
      setData(response);
    } catch (error) {
      setFetching(false);
      setError(error);
    }
  }, [config.baseUrl, JSON.stringify(opts), url, addResponse]);

  /** Data change in cache */
  useEffect(() => {
    // Data from cache is unchanged
    if (
      cacheState.data === undefined &&
      JSON.stringify(data) === JSON.stringify(cacheState.data)
    ) {
      return;
    }

    if (opts.cachePolicy === 'network-only') {
      return;
    }

    // Initial network request is yet to complete
    if (opts.cachePolicy === 'network-first' && data === undefined) {
      return;
    }

    setData(cacheState.data);
  }, [data, opts.cachePolicy, cacheState.data]);

  /** On mount. */
  useEffect(() => {
    if (opts.cachePolicy !== 'cache-only' && opts.onMount !== false) {
      doFetch();
    }
  }, []);

  /** On cache invalidation. */
  useEffect(() => {
    if (
      fetching ||
      opts.cachePolicy === 'cache-only' ||
      opts.cachePolicy === 'network-only'
    ) {
      return;
    }

    if (cacheState.refetch) {
      doFetch();
    }
  }, [fetching, opts.cachePolicy, cacheState.refetch]);

  return [{ fetching, error, data }, doFetch];
};
