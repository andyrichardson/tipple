import { TippleClientOptions } from './client';

/** Gets unique key of request. */
export const getKey = (url: string, fetchArgs: RequestInit) =>
  `${url}+${fetchArgs.body !== undefined ? fetchArgs.body : ''}`;

/** Collection of inflight GET requests. */
const inFlight: Record<string, any> = {};

/** Executes API call and throws when response is invalid. */
export const executeRequest = async <T = any>(
  url: string,
  fetchArgs: RequestInit
) => {
  // Exclude push requests from deduping
  if (fetchArgs.method !== undefined && fetchArgs.method !== 'GET') {
    return fetchAndParse<T>(url, fetchArgs);
  }

  const isInFlight = inFlight[url] !== undefined;
  const response = isInFlight
    ? (inFlight[url] as Promise<T>)
    : (inFlight[url] = fetchAndParse<T>(url, fetchArgs));

  if (!isInFlight) {
    const cleanup = () => delete inFlight[url];
    response.then(cleanup).catch(cleanup);
  }

  return response;
};

/** Fetch data and parse json (if possible). */
const fetchAndParse = async <T = any>(url: string, fetchArgs: RequestInit) => {
  const response = await fetch(url, fetchArgs);
  const data: T = await response.json().catch(() => response);

  if (!response.ok) {
    throw data;
  }

  return data;
};

/** Join hook fetchOptions with global config. */
type OptionalContextOptions = TippleClientOptions['fetchOptions'] | undefined;
type OptionalRequestInit = RequestInit | undefined;
export const mergeFetchOptions = (
  ...args:
    | [OptionalContextOptions]
    | [OptionalContextOptions, OptionalRequestInit]
    | [OptionalContextOptions, OptionalRequestInit, OptionalRequestInit]
) =>
  (args.slice(1) as RequestInit[]).reduce(
    (prev, current) => doMergeFetchOptions(prev, current),
    args[0]
  );

const doMergeFetchOptions = (
  contextOptions: TippleClientOptions['fetchOptions'] = o => o,
  clientOptions: RequestInit = {}
) =>
  typeof contextOptions === 'function'
    ? contextOptions(clientOptions)
    : {
        ...contextOptions,
        ...clientOptions,
        headers:
          contextOptions === undefined || contextOptions.headers === undefined
            ? clientOptions.headers
            : { ...contextOptions.headers, ...clientOptions.headers },
      };
