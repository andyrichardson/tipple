import {
  useContext,
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { TippleContext } from './context';
import { executeRequest, getKey, mergeFetchOptions } from './util';
import {
  UseFetchOptions,
  UseFetchResponse,
  ExecuteRequestOptions,
} from './types';

/** Hook for executing fetch requests (GET). */
export const useFetch = <T = any, D extends string = string>(
  url: string,
  opts: UseFetchOptions<D, T>
): UseFetchResponse<T> => {
  const fetchOnChange = useRef(
    opts.cachePolicy !== 'cache-only' && opts.autoFetch !== false
  );

  /** Unique identifier of request. */
  const key = useMemo(() => getKey(url, opts.fetchOptions || {}), [
    url,
    opts.fetchOptions,
  ]);

  const { config, cache, addResponse } = useContext(TippleContext);
  const cacheState = useMemo(
    () => cache[key] || { refetch: false, data: undefined },
    [cache[key]] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [fetching, setFetching] = useState<boolean>(fetchOnChange.current);
  const [responseData, setResponseData] = useState<T | undefined>(
    opts.cachePolicy !== 'network-only' && opts.cachePolicy !== 'network-first'
      ? cacheState.data
      : undefined
  );
  const [error, setError] = useState<Error | undefined>(undefined);

  /** Executes fetching of data. */
  const doFetch = useCallback(
    async (overrides: ExecuteRequestOptions = {}) => {
      setFetching(true);

      try {
        const response = await executeRequest(
          `${overrides.baseUrl || opts.baseUrl || config.baseUrl || ''}${url}`,
          {
            ...mergeFetchOptions(
              config.fetchOptions,
              opts.fetchOptions,
              overrides.fetchOptions
            ),
            method: 'GET',
          }
        );

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
    },
    [
      key,
      config.baseUrl,
      config.fetchOptions,
      opts.cachePolicy,
      opts.baseUrl,
      // @ts-ignore
      opts.domains,
      opts.fetchOptions,
      url,
      addResponse,
    ]
  );

  /** On mount. */
  useEffect(() => {
    if (fetchOnChange.current) {
      doFetch();
    }
  }, [doFetch]);

  /** Update autoFetch value. */
  useEffect(() => {
    fetchOnChange.current =
      opts.cachePolicy !== 'cache-only' && opts.autoFetch !== false;
  }, [opts]);

  /** Data change in cache. */
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
  }, [doFetch, fetching, opts.cachePolicy, cacheState.refetch]);

  const data = useMemo(
    () =>
      responseData !== undefined && opts.parseResponse !== undefined
        ? opts.parseResponse(responseData)
        : responseData,
    [responseData, opts]
  );

  return [{ fetching, error, data }, doFetch];
};
