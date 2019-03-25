import { createContext } from 'react';

interface AddResponseArgs<D extends string = string> {
  key: string;
  domains: D[];
  data: any;
}

interface ContextConfig {
  baseUrl?: string;
}

export interface TippleContext<D extends string = string> {
  config: ContextConfig;
  domains: Record<D, string[]>;
  responses: Record<string, any>;
  addResponse: (args: AddResponseArgs<D>) => void;
  clearDomains: (domain: D[]) => void;
}

export const Context = createContext<TippleContext>(null as any);
