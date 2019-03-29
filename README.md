<img alt="Tipple logo" src="https://github.com/andyrichardson/tipple/blob/master/docs/assets/logo.png?raw=true" width="250px" />

A lightweight dependency-free, library for fetching data over REST in React.

## What is Tipple?

Tipple is simple - so simple in fact, it has no dependencies.

If you're working with REST and want an easy way to manage data fetching on the client side, this might just be the way to go.

## How does it work?

There's two key parts to Tipple:

1.  Request state managment - _a fancy way of saying Tipple will manage the numerous states of your API calls so you don't have to._
2.  Domain based integrity - _because each request is tied to a domain (e.g. users, posts, comments), Tipple can force data to be re-fetched whenever [domain(s)](/docs/Domains.md) have been mutated._

## Getting started

### Install tipple

I'm sure you've done this before

```sh
npm i tipple
```

### Configure the context

Tipple uses React's context to store the responses and integrity states of requests. You'll want to put the provider in the root of your project.

```tsx
import { TippleProvider } from 'tipple';
import { AppContent } from './AppContent';

export const App = () => (
  <TippleProvider baseUrl="http://host:1234">
    <AppContent />
  </TippleProvider>
);
```

### Start requesting

The _useFetch_ hook will fetch the data you need on mount

```tsx
import { useFetch } from 'tipple';

interface User {
  id: number;
  name: string;
}

const MyComponent = () => {
  const [state, refetch] = useFetch<User[]>('/', { domains: ['users'] });
  const { fetching, error, data } = state;

  if (fetching && data === undefined) {
    return <p>Fetching</p>;
  }

  if (error || data === undefined) {
    return <p>Something went wrong</p>;
  }

  return (
    <>
      {data.map(user => (
        <h2 key={user.id}>{user.name}</h2>
      ))}
      <button onClick={refetch}>Refetch</button>
    </>
  );
};
```

## Further documentation

For more advanced usage, check out [the docs](/docs).
