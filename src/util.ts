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
