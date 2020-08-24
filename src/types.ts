export type CachePolicy =
  | 'cache-first'
  | 'cache-only'
  | 'network-first'
  | 'network-only';

export interface ExecuteRequestOptions {
  baseUrl?: string;
  fetchOptions?: RequestInit;
}

/** Use fetch options shared across all configs. */
export interface BaseUseFetchOptions<D extends string = string, T = any> {
  domains: D[];
  autoFetch?: boolean;
  parseResponse?: (response: any) => T;
  baseUrl?: string;
  fetchOptions?: RequestInit;
}

export type GeneralFetchOptions<T extends Partial<BaseUseFetchOptions>> = T & {
  cachePolicy: Exclude<CachePolicy, 'network-only' | 'cache-only'>;
};

export type CacheOnlyOption<T extends Partial<BaseUseFetchOptions>> = Omit<
  T,
  'autoFetch'
> & { cachePolicy: 'cache-only' };

export type NetworkOnlyOption<T extends Partial<BaseUseFetchOptions>> = Omit<
  T,
  'domains'
> & {
  cachePolicy: 'network-only';
};

/** Default useFetch options. */
type GeneralUseFetchOptions<D extends string, T> = GeneralFetchOptions<
  BaseUseFetchOptions<D, T>
>;
/** useFetch options without domain (for network-only). */
type NetworkOnlyUseFetchOptions<T> = NetworkOnlyOption<
  BaseUseFetchOptions<never, T>
>;
/** useFetch options without autoFetch option (for cache-only). */
type CacheOnlyUseFetchOptions<D extends string, T> = CacheOnlyOption<
  BaseUseFetchOptions<D, T>
>;

/** Config options for useFetch. */
export type UseFetchOptions<D extends string = string, T = any> =
  | GeneralUseFetchOptions<D, T>
  | NetworkOnlyUseFetchOptions<T>
  | CacheOnlyUseFetchOptions<D, T>;

/** Network information returned from useFetch. */
export interface FetchState<T = any> {
  fetching: boolean;
  data?: T;
  error?: Error;
}

/** useFetch hook response ([fetchState, refetch]). */
export type UseFetchResponse<T = any> = [FetchState<T>, () => void];

/** Re-export utility type for enforcing domain. */
export type TypedUseFetch<D extends string> = <T extends any>(
  url: string,
  opts: UseFetchOptions<D, T>
) => UseFetchResponse<T>;

/** Map of domain strings pointing to request keys */
export type DomainMap = Record<string, string[]>;

/** Map of request keys pointing to data states and refetch values */
export type ResponseMap = Record<string, { data: any; refetch: boolean }>;

/** Tipple provider props. */
export interface ProviderProps {
  /** Url to prefix all requests (e.g. "https://mydomain.com/api"). */
  baseUrl?: string;
  /** HTTP headers to append to all requests. */
  fetchOptions?: RequestInit | ((arg?: RequestInit) => RequestInit | undefined);
}

/** Utility type to Omit keys from an interface/object type */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
