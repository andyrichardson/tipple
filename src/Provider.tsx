import { FC, useState, useMemo } from 'react';
import { TippleContext } from './context';

type DomainMap = Record<string, string[]>;
type ResponseMap = Record<string, any>;

/**
 * Tipple provider props.
 *
 * @param baseUrl - Url to prefix all requests (e.g. "https://mydomain.com/api").
 * @param headers - HTTP headers to append to all requests.
 */
interface ProviderProps {
  baseUrl?: string;
  headers?: RequestInit['headers'];
}

/** Provider for using tipple. */
export const Provider: FC<ProviderProps> = ({ baseUrl, headers, children }) => {
  const [domains, setDomains] = useState<DomainMap>({});
  const [responses, setResponses] = useState<ResponseMap>({});

  const addResponse = useMemo(
    () => createAddResponse(domains, responses, setDomains, setResponses),
    [domains, responses]
  );
  const clearDomains = useMemo(
    () => createClearDomains(domains, responses, setResponses),
    [domains, responses]
  );

  const config = { baseUrl, headers };

  return (
    <TippleContext.Provider
      value={{ config, domains, responses, addResponse, clearDomains }}
    >
      {children}
    </TippleContext.Provider>
  );
};

/** Logic for adding a response. */
export const createAddResponse = (
  domains: Record<string, string[]>,
  responses: Record<string, any>,
  setDomains: (arg: Record<string, string[]>) => void,
  setResponses: (arg: Record<string, any>) => void
): TippleContext['addResponse'] => ({ key, domains: domainArr, data }) => {
  const updatedDomains = domainArr.reduce(
    (p, d) => ({ ...p, [d]: p[d] === undefined ? [key] : [...p[d], key] }),
    domains
  );

  setDomains(updatedDomains);
  setResponses({ ...responses, [key]: data });
};

/** Logic for clearing domains. */
export const createClearDomains = (
  domains: Record<string, string[]>,
  responses: Record<string, any>,
  setResponses: (arg: Record<string, any>) => void
): TippleContext['clearDomains'] => targetDomains =>
  targetDomains.forEach(domain => {
    if (domains[domain] === undefined) {
      return;
    }

    const updatedResponses = domains[domain].reduce(
      (p, d) => ({
        ...p,
        [d]: undefined,
      }),
      responses
    );
    setResponses(updatedResponses);
  });
