# Configuration

So, you have a decent understanding of how [Tipple's architecture](./Domains.md) works and you're looking to get started. Just follow the examples below or check out the [example project]('https://github.com/andyrichardson/tipple/blob/master/example').

## Setting up the provider

At the core of Tipple, we use [React's context API](https://reactjs.org/docs/context.html) to centralize both the state and functionality. To expose the client throughout your app, use the Tipple provider at the entrypoint (as demonstrated below).

```tsx
import React, { FC } from 'react';
import { createClient, TippleProvider } from 'tipple';
import { HomePage } from './Home';

const client = createClient({ 
  baseUrl: 'http://localhost:5000/api', 
  fetchOptions: { 
    headers: { 'Content-Type': 'application/json' }
  }
});

export const App: FC = () => (
  <TippleProvider client={client}>
    <HomePage />
  </TippleProvider>;
);
```

### Client options

Here are a few configurable options which you will want to make use of.

#### baseUrl

This is the endpoint for your REST API. This will be prefixed to all URLs passed to the _useFetc_ and _usePush_ hooks.

> Note: for consistency, it's best to avoid suffixing your baseUrl with a forward slash.

#### fetchOptions

Here you can specify any default fetchOptions for API calls. This is often useful for specifying default request headers or for authorization purposes. These defaults can be overridden by the fetchOptions specified in the _useFetch_ and _usePush_ hooks.

> Note: `fetchOptions` can also be a function. If this is the case, it will be called with the `fetchOptions` value that was passed to the requesting hook.

## Type safe domains

For consistency across your codebase, it is strongly recommended that you type your domains. Typed domains can be specified when calling useFetch as demonstrated below.

```tsx
type ValidDomain = 'posts' | 'comments' | 'users';

// This is type safe
const [response, refetch] = useFetch<ResponseType, ValidDomain>('/comments', {
  domains: ['comments'],
});

// This will throw an error
const [response, refetch] = useFetch<ResponseType, ValidDomain>('/comments', {
  domains: ['alerts'],
});
```

To force domain type safety throughout your application, you can proxy the _useFetch_ and _usePush_ hooks.

```tsx
// src/utils.ts
import { useFetch as useFetchOriginal, usePush as usePushOriginal TypedUseFetch, TypedUsePush } from 'tipple';

type Domain = 'posts' | 'comments' | 'users';

export const useFetch = useFetchOriginal as TypedUseFetch<Domain>;
export const usePush = usePushOriginal as TypedUsePush<Domain>;

// src/components/Home.tsx
import { useFetch } from '../utils';

//..

// Type error ('post' not in type Domain)
const [response, refetch] = useFetch('/comments', { domains: ['post'] });
```
