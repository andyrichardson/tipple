import React, { FC, useState, useEffect } from 'react';
import { TippleContext } from './context';
import { TippleClient, TippleCache } from './client';

/** Provider for using tipple. */
export const Provider: FC<{ client: TippleClient }> = ({
  client,
  children,
}) => {
  const [cache, setCache] = useState<TippleCache>(client.cache);

  useEffect(() => client.addCacheWatcher(setCache), [client]);

  return (
    <TippleContext.Provider value={{ ...client, cache }}>
      {children}
    </TippleContext.Provider>
  );
};
