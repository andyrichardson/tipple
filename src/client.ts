export type TippleCache<D extends string = string> = Record<
  string,
  { data: any; refetch: boolean; domains: D[] }
>;

export interface TippleClientOptions<D extends string = string> {
  baseUrl?: string;
  fetchOptions?: ((o: RequestInit) => RequestInit) | RequestInit;
  initialCache?: TippleCache<D>;
}

export interface TippleClient<D extends string = string> {
  config: TippleClientOptions<D>;
  /** Callback for cache updates. */
  addCacheWatcher: (callback: (cache: TippleCache<D>) => void) => () => void;
  /** Additions to cache. */
  addResponse: (arg: { key: string; data: any; domains: D[] }) => void;
  /** Invalidation of cache. */
  clearDomains: (domains: D[]) => void;
}

export const createClient = <D extends string = string>(
  config: TippleClientOptions<D> = {}
): TippleClient<D> => {
  let cache: TippleCache<D> = config.initialCache || {};
  let cacheWatchers: Array<(c: typeof cache) => void> = [];

  const addCacheWatcher: TippleClient<D>['addCacheWatcher'] = callback => {
    cacheWatchers = [...cacheWatchers, callback];
    return () => (cacheWatchers = cacheWatchers.filter(f => f === callback));
  };

  const addResponse: TippleClient<D>['addResponse'] = ({
    key,
    data,
    domains,
  }) => {
    cache = { ...cache, [key]: { data, domains, refetch: false } };
    cacheWatchers.forEach(c => c(cache));
  };

  const clearDomains: TippleClient<D>['clearDomains'] = domains => {
    cache = Object.entries(cache).reduce(
      (c, [key, value]) => ({
        ...c,
        [key]: {
          ...value,
          refetch: value.domains.some(d => domains.includes(d)),
        },
      }),
      {}
    );
    cacheWatchers.forEach(c => c(cache));
  };

  return {
    config,
    addCacheWatcher,
    addResponse,
    clearDomains,
  };
};
