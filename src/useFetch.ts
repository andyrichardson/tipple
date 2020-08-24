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
  FetchState,
} from './types';

/** Hook for executing fetch requests (GET). */
export const useFetch = <T = any, D extends string = string>(
  url: string,
  opts: UseFetchOptions<D, T>
): UseFetchResponse<T> => {
  const { config, cache, addResponse } = useContext(TippleContext);
  const fetchOnChange = useRef(
    opts.cachePolicy !== 'cache-only' && opts.autoFetch !== false
  );

  /** Unique identifier of request. */
  const key = useMemo(() => getKey(url, opts.fetchOptions || {}), [
    url,
    opts.fetchOptions,
  ]);

  const cacheState = useMemo(
    () => cache[key] || { refetch: false, data: undefined },
    [cache[key]] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [state, setState] = useState<FetchState<T>>({
    fetching: fetchOnChange.current,
    data:
      opts.cachePolicy !== 'network-only' &&
      opts.cachePolicy !== 'network-first'
        ? cacheState.data
        : undefined,
    error: undefined,
  });

  /** Executes fetching of data. */
  const doFetch = useCallback(
    async (overrides: ExecuteRequestOptions = {}) => {
      setState(s => ({
        ...s,
        fetching: true,
      }));

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

        setState(s => ({
          ...s,
          fetching: false,
          data: response,
        }));
      } catch (error) {
        setState(s => ({
          ...s,
          fetching: false,
          error: error,
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      key,
      config.baseUrl,
      config.fetchOptions,
      JSON.stringify(opts), // eslint-disable-line react-hooks/exhaustive-deps
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
      JSON.stringify(state.data) === JSON.stringify(cacheState.data)
    ) {
      return;
    }

    if (opts.cachePolicy === 'network-only') {
      return;
    }

    // Initial network request is yet to complete
    if (opts.cachePolicy === 'network-first' && state.data === undefined) {
      return;
    }

    setState(s => ({ ...s, data: cacheState.data }));
  }, [state.data, opts.cachePolicy, cacheState.data]);

  /** On cache invalidation. */
  useEffect(() => {
    if (
      state.fetching ||
      opts.cachePolicy === 'cache-only' ||
      opts.cachePolicy === 'network-only'
    ) {
      return;
    }

    if (cacheState.refetch) {
      doFetch();
    }
  }, [doFetch, state.fetching, opts.cachePolicy, cacheState.refetch]);

  return useMemo(
    () => [
      {
        ...state,
        data:
          state.data !== undefined && opts.parseResponse
            ? opts.parseResponse(state.data)
            : state.data,
      },
      doFetch,
    ],
    [state, doFetch]
  );
};
