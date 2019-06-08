import { TippleClientOptions } from './client';

/** Gets unique key of request. */
export const getKey = (url: string, fetchArgs: RequestInit) =>
  `${url}+${fetchArgs.body !== undefined ? fetchArgs.body : ''}`;

/** Collection of inflight GET requests. */
const inFlight: Record<string, any> = {};

/** Executes API call and throws when response is invalid. */
export const executeRequest = async (url: string, fetchArgs: RequestInit) => {
  // Exclude push requests from deduping
  if (fetchArgs.method !== undefined && fetchArgs.method !== 'GET') {
    return fetchAndParse(url, fetchArgs);
  }

  const isInFlight = inFlight[url] !== undefined;
  const response = isInFlight
    ? inFlight[url]
    : (inFlight[url] = fetchAndParse(url, fetchArgs));

  if (!isInFlight) {
    const cleanup = () => delete inFlight[url];
    response.then(cleanup).catch(cleanup);
  }

  return response;
};

/** Fetch data and parse json (if possible). */
const fetchAndParse = async (url: string, fetchArgs: RequestInit) => {
  const response = await fetch(url, fetchArgs);
  const data = await response.json().catch(() => response);

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
) => {
  if (args.length < 2) {
    throw Error('Cannot merge less than two values');
  }

  return (args.slice(1) as RequestInit[]).reduce(
    (prev, current) => doMergeFetchOptions(prev, current),
    args[0]
  );
};

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
