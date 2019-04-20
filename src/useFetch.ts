import { useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { TippleContext } from './context';
import { executeRequest, getKey } from './util';
import { UseFetchOptions, UseFetchResponse } from './types';

export const useFetch = <T = any, D extends string = string>(
  url: string,
  opts: UseFetchOptions<D>
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
    opts.cachePolicy !== 'cache-only' && opts.onMount !== false
  );
  const [data, setData] = useState<T | undefined>(responses[key]);
  const [error, setError] = useState<Error | undefined>(undefined);

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

  /** On mount. */
  useEffect(() => {
    if (opts.cachePolicy !== 'cache-only' && opts.onMount !== false) {
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
