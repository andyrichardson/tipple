import { createContext } from 'react';

export interface AddResponseArgs<D extends string = string> {
  key: string;
  domains: D[];
  data: any;
}

export interface ContextConfig {
  baseUrl?: string;
  headers?: RequestInit['headers'];
}

export interface TippleContext<D extends string = string> {
  config: ContextConfig;
  domains: Record<D, string[]>;
  responses: Record<string, { refetch: boolean; data: any }>;
  addResponse: (args: AddResponseArgs<D>) => void;
  clearDomains: (domain: D[]) => void;
}

export const TippleContext = createContext<TippleContext>(null as any);
