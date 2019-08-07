import { createContext } from 'react';
import { TippleClient, TippleCache } from './client';

export const TippleContext = createContext<
  TippleClient & { cache: TippleCache }
>(null as any);
