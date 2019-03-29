import { useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { TippleContext } from './context';
import { executeRequest, getKey } from './util';

export type TypedUseFetch<D extends string> = <T extends any>(
  url: string,
  opts: UseFetchOptions<D>
) => UseFetchResponse<T>;

export interface FetchState<T = any> {
  fetching: boolean;
  data?: T;
  error?: Error;
}

interface UseFetchOptions<D extends string> {
  domains: D[];
  onMount?: boolean;
  fetchOptions?: RequestInit;
}

type UseFetchResponse<T = any> = [FetchState<T>, () => void];

export const useFetch = <T = any, D extends string = string>(
  url: string,
  opts: UseFetchOptions<D>
): UseFetchResponse<T> => {
  const { config, responses, addResponse, clearDomains } = useContext(
    TippleContext
  );
  const [state, setState] = useState<FetchState<T>>({ fetching: true });

  /** Unique identifier of request. */
  const key = useMemo(() => getKey(url, opts.fetchOptions || {}), [
    url,
    opts.fetchOptions,
  ]);

  /** Data parsed from cache/request. */
  const data = useMemo(() => responses[key], [responses, key]);

  /** Executes fetching of data. */
  const doFetch = useCallback(async () => {
    setState({ ...state, fetching: true });

    try {
      const response = await executeRequest(`${config.baseUrl || ''}${url}`, {
        ...opts.fetchOptions,
        headers: { ...config.headers, ...(opts.fetchOptions || {}).headers },
      });

      addResponse({ data: response, key, domains: opts.domains });
      setState({ fetching: false });
    } catch (error) {
      setState({ ...state, error });
    }
  }, [state, opts.domains, addResponse]);

  /** On mount. */
  useEffect(() => {
    doFetch();
  }, []);

  /** On data change. */
  useEffect(() => {
    if (!state.fetching && data === undefined) {
      doFetch();
    }
  }, [JSON.stringify(data), state.fetching]);

  return [{ ...state, data }, doFetch];
};
