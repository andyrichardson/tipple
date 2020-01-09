import React, { FC, useState, useEffect, useRef, useMemo } from 'react';
import { TippleContext } from './context';
import { TippleClient, TippleCache } from './client';

/** Provider for using tipple. */
export const Provider: FC<{ client: TippleClient }> = ({
  client,
  children,
}) => {
  const config = useRef(client.config);
  const [cache, setCache] = useState<TippleCache>(
    client.config.initialCache || {}
  );

  useEffect(() => client.addCacheWatcher(setCache), [client]);

  const value = useMemo(() => ({ ...client, cache, config: config.current }), [
    cache,
  ]);

  console.log(value);
  return (
    <TippleContext.Provider value={value}>{children}</TippleContext.Provider>
  );
};
Provider.displayName = 'TippleProvider';
