import { useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { Context } from './context';

export interface FetchState<T = any> {
  fetching: boolean;
  data?: T;
  error?: Error;
}

interface UseFetchOptions<D extends string> {
  domains: D[];
  onMount?: boolean;
}

type UseFetchResponse<T = any> = [FetchState<T>, () => void];

export const useFetch = <T = any, D extends string = string>(
  url: string,
  opts: UseFetchOptions<D>,
  fetchArgs: RequestInit = {}
): UseFetchResponse<T> => {
  const { config, responses, addResponse, clearDomains } = useContext(Context);
  const [state, setState] = useState<FetchState<T>>({ fetching: true });

  /** Unique identifier of request. */
  const key = useMemo(() => getKey(url, fetchArgs), [url, fetchArgs]);
  /** POST, DELETE, etc. (not GET) */
  const isMutationType = useMemo(() => isMutation(fetchArgs), [fetchArgs]);
  /** Data parsed from cache/request. */
  const data = useMemo(() => (isMutationType ? state.data : responses[key]), [
    responses,
    key,
    isMutationType,
  ]);

  /** Executes fetching of data. */
  const doFetch = useCallback(async () => {
    setState({ ...state, fetching: true });

    try {
      const response = await executeRequest(`${config.baseUrl || ''}${url}`, {
        ...fetchArgs,
        headers: { ...config.headers, ...fetchArgs.headers },
      });

      if (isMutationType) {
        clearDomains(opts.domains);
        setState({ fetching: false, data: response });
      } else {
        addResponse({ data: response, key, domains: opts.domains });
        setState({ fetching: false });
      }
    } catch (error) {
      setState({ ...state, error });
    }
  }, [state, isMutationType, opts.domains, addResponse]);

  /** On mount */
  useEffect(() => {
    if (!isMutationType) {
      doFetch();
    }
  }, []);

  /** On data change */
  useEffect(() => {
    if (!state.fetching && !isMutationType && data === undefined) {
      doFetch();
    }
  }, [JSON.stringify(data), state.fetching, isMutationType]);

  return [{ ...state, data }, doFetch];
};

const executeRequest = async (url: string, fetchArgs: RequestInit) => {
  const response = await fetch(url, fetchArgs);
  const json = await response.json();

  if (!response.ok) {
    throw json;
  }

  return json;
};

/** Asserts whether request updates/mutates the domain. */
const isMutation = (fetchArgs: RequestInit) =>
  fetchArgs !== undefined &&
  fetchArgs.method !== undefined &&
  fetchArgs.method.toUpperCase() !== 'GET';

const getKey = (url: string, fetchArgs: RequestInit) =>
  `${url}+${fetchArgs.body !== undefined ? fetchArgs.body : ''}`;
