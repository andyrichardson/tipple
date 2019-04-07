# Configuration

So, you have a decent understanding of how [Tipple's architecture](./Domains.md) works and you're looking to get started. Just follow the examples below or check out the [example project]('../example').

## Setting up the provider

At the core of Tipple, we use [React's context API](https://reactjs.org/docs/context.html) to centralize both the state and functionality. To expose this throughout your app, use the Tipple provider at the entrypoint (as demonstrated below).

```tsx
import React, { FC } from 'react';
import { TippleProvider } from 'tipple';
import { HomePage } from './Home';

export const App: FC = () => (
  <TippleProvider baseUrl={'http://localhost:5000/api'}>
    <HomePage />
  </TippleProvider>;
);
```

### Provider options

Here are a few configurable options which you will want to make use of.

#### baseUrl

This is the endpoint for your REST API. This will be prefixed to all URLs passed to the `useFetch` and `usePush` hooks.

```tsx
// App.tsx
export const App: FC = () => (
  <TippleProvider baseUrl={'http://localhost:5000/api'}>
    <HomePage />
  </TippleProvider>;
);

// HomePage.tsx
const [data, refetch] = useQuery('/users', { domains: ['users'] }); // The fetch request is sent to 'http://host:1234/api/users'
```

> Note: for consistency, it's best to avoid suffixing your baseUrl with a forward slash.

#### headers

Here you can specify any default headers for API calls. This is often useful for specifying a default content-type or for authorization purposes.

```tsx
export const App: FC = () => (
  <TippleProvider headers={{ 'Content-Type': 'application/json' }}>
    <HomePage />
  </TippleProvider>;
);
```

> Note: default headers can be overridden at a later stage with `fetchOptions`.
