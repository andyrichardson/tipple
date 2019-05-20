import { ContextConfig } from './context';

/** Gets unique key of request. */
export const getKey = (url: string, fetchArgs: RequestInit) =>
  `${url}+${fetchArgs.body !== undefined ? fetchArgs.body : ''}`;

/** Executes API call and throws when response is invalid. */
export const executeRequest = async (url: string, fetchArgs: RequestInit) => {
  const response = await fetch(url, fetchArgs);
  const json = await response.json();

  if (!response.ok) {
    throw json;
  }

  return json;
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
