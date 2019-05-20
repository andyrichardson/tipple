import { createContext } from 'react';
import { DomainMap, ResponseMap, ProviderProps } from './types';

export interface AddResponseArgs<D extends string = string> {
  key: string;
  domains: D[];
  data: any;
}

export interface ContextConfig {
  baseUrl?: string;
  fetchOptions?: ProviderProps['fetchOptions'];
}

export interface TippleContext<D extends string = string> {
  config: ContextConfig;
  domains: DomainMap;
  responses: ResponseMap;
  addResponse: (args: AddResponseArgs<D>) => void;
  clearDomains: (domain: D[]) => void;
}

export const TippleContext = createContext<TippleContext>(null as any);
