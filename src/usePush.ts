import { useContext, useCallback, useState } from 'react';
import { TippleContext } from './context';
import { executeRequest, mergeFetchOptions } from './util';
import { ExecuteRequestOptions } from './types';

export type TypedUsePush<D extends string> = <T extends any>(
  url: string,
  opts: UsePushOptions<D>
) => UsePushResponse<T>;

export interface PushState<T = any> {
  fetching: boolean;
  data?: T;
  error?: Error;
}

interface UsePushOptions<D extends string> {
  domains: D[];
  onMount?: boolean;
  baseUrl?: string;
  fetchOptions?: RequestInit;
}

type UsePushResponse<T = any> = [PushState<T>, () => Promise<T>, () => void];

/** Hook for executing push requests (POST, PUT, DELETE, etc.). */
export const usePush = <T = any, D extends string = string>(
  url: string,
  opts: UsePushOptions<D>
): UsePushResponse<T> => {
  const { config, clearDomains } = useContext(TippleContext);
  const [state, setState] = useState<PushState<T>>({ fetching: false });

  /** Executes fetching of data. */
  const doFetch = useCallback(async (overrides: ExecuteRequestOptions = {}) => {
    setState({ ...state, fetching: true });

    try {
      const response = await executeRequest(
        `${overrides.baseUrl || opts.baseUrl || config.baseUrl || ''}${url}`,
        {
          method: 'POST',
          ...mergeFetchOptions(config.fetchOptions, opts.fetchOptions, overrides.fetchOptions),
        }
      );

      clearDomains(opts.domains);
      setState({ fetching: false, data: response });
      return response;
    } catch (error) {
      setState({ ...state, error });
      throw error;
    }
  }, [state, JSON.stringify(opts)]);

  const reset = useCallback(() => setState({ fetching: false }), []);

  return [{ ...state }, doFetch, reset];
};
