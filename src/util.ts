import { ContextConfig } from './context';

/** Gets unique key of request. */
export const getKey = (url: string, fetchArgs: RequestInit) =>
  `${url}+${fetchArgs.body !== undefined ? fetchArgs.body : ''}`;

interface inFlightInteface {
  [url: string]: Promise<object>;
}

let inFlight: inFlightInteface = {};

/** Executes API call and throws when response is invalid. */
export const executeRequest = async (url: string, fetchArgs: RequestInit) => {
  let response;

  const isInFlight = inFlight[url] !== undefined;

  if (isInFlight) {
    response = inFlight[url];
  } else {
    response = fetchAndParseRequest(url, fetchArgs);
    inFlight[url] = response;

    const cleanup = () => delete inFlight[url];
    response.then(cleanup).catch(cleanup);
  }

  return response;
};

/** Join hook fetchOptions with global config. */
export const mergeFetchOptions = (
  contextOptions: ContextConfig['fetchOptions'] = o => o,
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

const fetchAndParseRequest = async (url: string, fetchArgs: RequestInit) => {
  const response = await fetch(url, fetchArgs);

  const json = await response.json();

  if (!response.ok) {
    throw json;
  }

  return json;
};
