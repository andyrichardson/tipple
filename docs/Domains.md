# Domains

### Domains in Tipple

Domains are the way in which we determine the type of data we're working with in a request. Think of it as the key data types of your data model (e.g. Users, Posts, Comments, etc).

### Specifying a domain with useFetch

We can set the domain of our requests when calling useFetch. The example below gets comments for a post.

```tsx
const [response, refetch] = useFetch('/posts/1/comments', {
  domains: ['comments'],
});
```

If a user is to add a new comment to a post, we would want this to be reflected in our UI. By specifying the domain in both our retrieval (above) and mutation (below) calls, we can be sure that all requests dependent on the "comments" domain will be refetched following a mutation.

```tsx
const [response, addComment] = useFetch('/posts/1/comments', {
  domains: ['comments'],
  fetchOptions: { method: 'POST' },
});
addComment(); // This will cause the request in the first example to be refetched
```

> Note: A 'mutatation' refers to any request where data in the target domain is being changed (in other words, anything which is not a GET request).

### Type safe domains

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

To force domain type safety throughout your application, you can proxy the _useFetch_ hook.

```tsx
// src/utils.ts
import { useFetch as useFetchOriginal, TippleTypedFetch } from 'tipple';

type Domain = 'posts' | 'comments' | 'users';

export const useFetch = useFetchOriginal as TypedUseFetch<Domain>;

// src/components/Home.ts
import { useFetch } from '../utils';

//..

// Type error ('post' not in type Domain)
const [response, refetch] = useFetch('/comments', { domains: ['post'] });
```
