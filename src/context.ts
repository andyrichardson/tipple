import { createContext } from 'react';
import { TippleClient } from './client';

export const TippleContext = createContext<TippleClient>(null as any);
