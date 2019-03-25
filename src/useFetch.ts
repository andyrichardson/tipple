import { useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { TakeAContext, Context } from './context';

export interface FetchState<T = any> {
  fetching: boolean;
  data?: T;
  error?: Error;
}

interface UseFetchOptions {
  domains: string[];
  onMount?: boolean;
}

type UseFetchResponse<T = any> = [FetchState<T>, () => void];

export const useFetch = <T>(
  url: string,
  opts: UseFetchOptions,
  fetchArgs: RequestInit = {}
): UseFetchResponse<T> => {
  const { responses, addResponse, clearDomains } = useContext(TakeAContext);
  const [state, setState] = useState<FetchState<T>>({ fetching: true });

  const key = useMemo(() => getKey(url, fetchArgs), [url, fetchArgs]);
  const isMutationType = useMemo(() => isMutation(fetchArgs), [fetchArgs]);
  const data = useMemo(() => (isMutationType ? state.data : responses[key]), [
    responses,
    key,
    isMutationType,
  ]);

  // Executor
  const doFetch = useCallback(async () => {
    setState({ ...state, fetching: true });

    try {
      const response = await executeRequest(url, fetchArgs);

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

  useEffect(() => {
    console.log('Callll');
    if (!isMutationType) {
      console.log('FETCH');
      doFetch();
    }
  }, []);

  useEffect(() => {
    if (!state.fetching && !isMutationType && data === undefined) {
      doFetch();
    }
  }, [JSON.stringify(data), state.fetching]);

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
