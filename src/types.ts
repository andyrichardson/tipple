export type CachePolicy =
  | 'cache-first'
  | 'cache-only'
  | 'network-first'
  | 'network-only';

/** Use fetch options shared across all configs. */
export interface BaseUseFetchOptions<D extends string = string> {
  onMount?: boolean;
  fetchOptions?: RequestInit;
  domains: D[];
}

/** Default useFetch options. */
export interface GeneralUseFetchOptions<D extends string = string>
  extends BaseUseFetchOptions<D> {
  cachePolicy?: Exclude<CachePolicy, 'network-only' | 'cache-only'>;
}

/** useFetch options without domain (for network-only). */
export interface NetworkOnlyUseFetchOptions
  extends Omit<BaseUseFetchOptions, 'domains'> {
  cachePolicy: 'network-only';
}

/** useFetch options without onMount option (for cache-only). */
export interface CacheOnlyUseFetchOptions<D extends string>
  extends Omit<BaseUseFetchOptions<D>, 'onMount'> {
  cachePolicy: 'cache-only';
}

/** Config options for useFetch. */
export type UseFetchOptions<D extends string = string> =
  | GeneralUseFetchOptions<D>
  | NetworkOnlyUseFetchOptions
  | CacheOnlyUseFetchOptions<D>;

/** Network information returned from useFetch. */
export interface FetchState<T = any> {
  fetching: boolean;
  data?: T;
  error?: Error;
}

/** useFetch hook response. */
export type UseFetchResponse<T = any> = [FetchState<T>, () => void];

/** Re-export utility type for enforcing domain. */
export type TypedUseFetch<D extends string> = <T extends any>(
  url: string,
  opts: UseFetchOptions<D>
) => UseFetchResponse<T>;

export type DomainMap = Record<string, string[]>;
export type ResponseMap = Record<string, any>;

/**
 * Tipple provider props.
 *
 * @param baseUrl - Url to prefix all requests (e.g. "https://mydomain.com/api").
 * @param headers - HTTP headers to append to all requests.
 */
export interface ProviderProps {
  baseUrl?: string;
  headers?: RequestInit['headers'];
}

/** Utility type to Omit keys from an interface/object type */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
