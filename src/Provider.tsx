import React, { FC, useState, useMemo, Dispatch, SetStateAction } from 'react';
import { TippleContext } from './context';
import { ProviderProps, DomainMap, ResponseMap } from './types';

/** Provider for using tipple. */
export const Provider: FC<ProviderProps> = ({ baseUrl, headers, children }) => {
  const [domains, setDomains] = useState<DomainMap>({});
  const [responses, setResponses] = useState<ResponseMap>({});

  const addResponse = useMemo(
    () => createAddResponse(setDomains, setResponses),
    []
  );

  const clearDomains = useMemo(
    () => createClearDomains(domains, setResponses),
    [domains]
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
  setDomains: Dispatch<SetStateAction<Record<string, string[]>>>,
  setResponses: Dispatch<SetStateAction<Record<string, any>>>
): TippleContext['addResponse'] => ({ key, domains, data }) => {
  // Add key to specified domains
  setDomains(domainsState =>
    domains.reduce(
      (p, d) => ({ ...p, [d]: p[d] === undefined ? [key] : [...p[d], key] }),
      domainsState
    )
  );

  setResponses(responses => ({ ...responses, [key]: data }));
};

/** Logic for clearing domains. */
export const createClearDomains = (
  domains: Record<string, string[]>,
  setResponses: Dispatch<SetStateAction<Record<string, any>>>
): TippleContext['clearDomains'] => targetDomains =>
  targetDomains.forEach(domain => {
    if (domains[domain] === undefined) {
      return;
    }

    setResponses(responsesState =>
      domains[domain].reduce(
        (p, d) => ({
          ...p,
          [d]: undefined,
        }),
        responsesState
      )
    );
  });
