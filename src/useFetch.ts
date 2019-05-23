import { useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { TippleContext } from './context';
import { executeRequest, getKey, mergeFetchOptions } from './util';
import { UseFetchOptions, UseFetchResponse } from './types';

/** Hook for executing fetch requests (GET). */
export const useFetch = <T = any, D extends string = string>(
  url: string,
  opts: UseFetchOptions<D, T>
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
  const [responseData, setResponseData] = useState<T | undefined>(
    opts.cachePolicy !== 'network-only' && opts.cachePolicy !== 'network-first'
      ? cacheState.data
      : undefined
  );
  const [error, setError] = useState<Error | undefined>(undefined);

  let inFlight: string[] = [];

  /** Executes fetching of data. */
  const doFetch = useCallback(async () => {
    setFetching(true);

    const urlToFetch = `${opts.baseUrl || config.baseUrl || ''}${url}`;

    const isInFlight = inFlight.find(element => element === urlToFetch);

    if (!isInFlight) {
      inFlight.push(urlToFetch);
      try {
        const response = await executeRequest(urlToFetch, {
          ...mergeFetchOptions(config.fetchOptions, opts.fetchOptions),
          method: 'GET',
        });

        const indexOfFetchedRequest = inFlight.indexOf(urlToFetch);

        inFlight.splice(indexOfFetchedRequest, 1);

        // Sharing with cache
        if (opts.cachePolicy !== 'network-only') {
          addResponse({
            data: response,
            key,
            domains: opts.domains,
          });
        }

        setFetching(false);
        setResponseData(response);
      } catch (error) {
        setFetching(false);
        setError(error);
      }
    }
  }, [config.baseUrl, JSON.stringify(opts), url, addResponse]);

  /** Data change in cache */
  useEffect(() => {
    // Data from cache is unchanged
    if (
      cacheState.data === undefined &&
      JSON.stringify(responseData) === JSON.stringify(cacheState.data)
    ) {
      return;
    }

    if (opts.cachePolicy === 'network-only') {
      return;
    }

    // Initial network request is yet to complete
    if (opts.cachePolicy === 'network-first' && responseData === undefined) {
      return;
    }

    setResponseData(cacheState.data);
  }, [responseData, opts.cachePolicy, cacheState.data]);

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

  const data = useMemo(
    () =>
      responseData !== undefined && opts.parseResponse !== undefined
        ? opts.parseResponse(responseData)
        : responseData,
    [responseData]
  );

  return [{ fetching, error, data }, doFetch];
};
