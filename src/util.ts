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

/** Fetch data and parse json. */
const fetchAndParse = async (url: string, fetchArgs: RequestInit) => {
  const response = await fetch(url, fetchArgs);
  const json = await response.json();

  if (!response.ok) {
    throw json;
  }

  return json;
};

/** Join hook fetchOptions with global config. */
export const mergeFetchOptions = (
  contextOptions: TippleClientOptions['fetchOptions'] = o => o,
  clientOptions: RequestInit = {}
) =>
  typeof contextOptions === 'function'
    ? contextOptions(clientOptions)
    : {
        ...contextOptions,
        ...clientOptions,
        headers:
          contextOptions === undefined
            ? clientOptions.headers
            : { ...contextOptions.headers, ...clientOptions.headers },
      };
