<p align="center">
  <img alt="Tipple logo" src="https://github.com/andyrichardson/tipple/blob/master/docs/assets/logo.png?raw=true" width="150px" />
</p>

<h1 align="center">Tipple</h1>
<p align="center"><i>A lightweight dependency-free library for fetching data over REST in React.</i></p>

<p align="center">
  <a href="https://gitlab.com/andyrichardson/tipple/pipelines">
    <img src="https://img.shields.io/gitlab/pipeline/andyrichardson/tipple.svg" alt="Gitlab pipeline status">
  </a>
  <a href="https://codecov.io/gh/andyrichardson/tipple">
    <img src="https://img.shields.io/codecov/c/github/andyrichardson/tipple.svg" alt="coverage">
  </a>
  <a href="https://npmjs.com/package/tipple">
    <img src="https://img.shields.io/github/package-json/v/andyrichardson/tipple.svg" alt="version" />
  </a>
  <a href="https://bundlephobia.com/result?p=tipple">
    <img src="https://img.shields.io/bundlephobia/minzip/tipple.svg" alt="size" />
  </a>
  <a href="https://github.com/andyrichardson/tipple/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/tipple.svg" alt="licence">
  </a>
</p>

## What is Tipple?

Tipple is simple - so simple in fact, it has no dependencies.

If you're working with REST and want an easy way to manage data fetching on the client side, this might just be the way to go.

## How does it work?

There's two key parts to Tipple:

1.  Request state management - _a fancy way of saying Tipple will manage the numerous states of your API calls so you don't have to._
2.  Domain based integrity - _because each request is tied to a domain (e.g. users, posts, comments), Tipple can force data to be re-fetched whenever [domain(s)](/docs/Domains.md) have been mutated._

## Getting started

### Install tipple

I'm sure you've done this before

```sh
npm i tipple
```

### Configure the context

Tipple exposes the client using React's context. You'll want to put the provider in the root of your project in order to use the _useFetch_ and _usePush_ hooks.

```tsx
import { createClient, TippleProvider } from 'tipple';
import { AppContent } from './AppContent';

const client = createClient({ baseUrl: 'http://localhost:1234/api' });

export const App = () => (
  <TippleProvider client={client}>
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

There's also an [example project](https://github.com/andyrichardson/tipple/tree/master/example) if you're into that kind of thing.
