import { createContext } from 'react';

interface AddResponseArgs<D extends string = string> {
  key: string;
  domains: D[];
  data: any;
}

export interface Context<D extends string = string> {
  domains: Record<D, string[]>;
  responses: Record<string, any>;
  addResponse: (args: AddResponseArgs<D>) => void;
  clearDomains: (domain: D[]) => void;
}

export const TakeAContext = createContext<Context>(null as any);
