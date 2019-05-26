# Domains

Domains are the way in which we determine the type of data we're working with in a request. Think of it as the key data types of your data model (e.g. Users, Posts, Comments, etc).

### Specifying a domain with useFetch

We can set the domain of our requests when calling useFetch. The example below gets comments for a post.

```tsx
const [response, refetch] = useFetch('/posts/1/comments', {
  domains: ['comments'],
});
```

If a user is to add a new comment to a post, we would want this to be reflected in our UI. By specifying the domain in both our fetch (above) and push (below) calls, we can be sure that all requests dependent on the "comments" domain will be refetched following a push.

```tsx
const [response, addComment] = usePush('/posts/1/comments', {
  domains: ['comments'],
  fetchOptions: { method: 'POST' },
});
addComment(); // This will cause the request in the first example to be refetched
```

> Note: A 'push' refers to any request where data in the target domain is being changed (in other words, anything which is not a GET request).

### Manual domain invalidation

For times where we want to invalidate a domain outside of the _usePush_ hook (such as when receiving updates over a websocket), the client has a _clearDomains_ function.

```tsx
  import { TippleContext } from 'tipple';

  const MyComponent = () => {
    // Retrieve the client from inside a component
    const client = useContext(TippleContext);

    //.. 

    notificationStream.subscribe(() => client.clearDomains(['notifications']));
  }
```