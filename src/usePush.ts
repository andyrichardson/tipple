import { useContext, useCallback, useState } from 'react';
import { TippleContext } from './context';
import { executeRequest } from './util';

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

export const usePush = <T = any, D extends string = string>(
  url: string,
  opts: UsePushOptions<D>
): UsePushResponse<T> => {
  const { config, clearDomains } = useContext(TippleContext);
  const [state, setState] = useState<PushState<T>>({ fetching: false });

  /** Executes fetching of data. */
  const doFetch = useCallback(async () => {
    setState({ ...state, fetching: true });

    try {
      const response = await executeRequest(
        `${opts.baseUrl || config.baseUrl || ''}${url}`,
        {
          ...opts.fetchOptions,
          headers: { ...config.headers, ...(opts.fetchOptions || {}).headers },
        }
      );

      clearDomains(opts.domains);
      setState({ fetching: false, data: response });
      return response;
    } catch (error) {
      setState({ ...state, error });
      throw error;
    }
  }, [state, opts.domains]);

  const reset = useCallback(() => setState({ fetching: false }), []);

  return [{ ...state }, doFetch, reset];
};
