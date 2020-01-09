import { ExecuteRequestOptions } from './types';
import {
  mergeFetchOptions,
  executeRequest as executeRequestUtil,
} from './util';

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
  addCacheWatcher: (callback: (cache: TippleCache<D>) => void) => void;
  addResponse: (arg: { key: string; data: any; domains: D[] }) => void;
  clearDomains: (domains: D | D[]) => void;
  executeRequest: <T>(url: string, opts?: ExecuteRequestOptions) => Promise<T>;
  cache: TippleCache<D>;
  config: TippleClientOptions<D>;
}

export class Client<D extends string = string> implements TippleClient<D> {
  private _cacheWatchers: Array<(c: TippleCache<D>) => void> = [];
  private _cache: TippleCache<D>;

  constructor(private _config: TippleClientOptions<D> = {}) {
    this._cache = _config.initialCache || {};
  }

  /** Add event listener for changes to cache. */
  public addCacheWatcher: TippleClient<D>['addCacheWatcher'] = callback => {
    this._cacheWatchers = [...this._cacheWatchers, callback];
    return () =>
      (this._cacheWatchers = this._cacheWatchers.filter(f => f === callback));
  };

  /** Add new response to cache. */
  public addResponse: TippleClient<D>['addResponse'] = ({
    key,
    data,
    domains,
  }) => {
    this._cache = {
      ...this._cache,
      [key]: { data, domains, refetch: false },
    };
    this._cacheWatchers.forEach(c => c(this._cache));
  };

  /** Invalidate domain/s in cache. */
  public clearDomains: TippleClient<D>['clearDomains'] = arg => {
    const domains = Array.isArray(arg) ? arg : [arg];

    this._cache = Object.entries(this._cache).reduce(
      (c, [key, value]) => ({
        ...c,
        [key]: {
          ...value,
          refetch: value.domains.some(d => domains.includes(d)),
        },
      }),
      {}
    );
    this._cacheWatchers.forEach(c => c(this._cache));
  };

  /** Create fetch request with client fetchOptions (or merged additional options). */
  public executeRequest = <T = any>(
    url: string,
    opts: ExecuteRequestOptions = {}
  ) =>
    executeRequestUtil<T>(
      `${opts.baseUrl || this.config.baseUrl || ''}${url}`,
      {
        ...mergeFetchOptions(this._config.fetchOptions, opts.fetchOptions),
      }
    );

  /** Cache state accessor method. */
  public get cache() {
    return this._cache;
  }

  /** Cache state accessor method. */
  public get config() {
    return this._config;
  }
}

export const createClient = <D extends string = string>(
  config: TippleClientOptions<D>
): TippleClient<D> => new Client<D>(config);
