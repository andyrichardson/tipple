# Hooks

Hooks are going to be the interface between you and your Graphql API. Currently there are two types of hook `useFetch` and `usePush`.

> Before diving into this section, it's advised that you take a look at how [domains](./Domains.md) and [configuration](./Configuration.md) work in Tipple.

## useFetch

This is your go-to interface for information retrieval (`GET` requests). Below is an example of a component using `useFetch` which retrieves a collection of users.

```tsx
import { useFetch } from 'tipple';
import { GetUsersResponse, Domain } from './types';
import { Button, ErrorCard, Spinner, UserCard } from './components';

export const Users: FC = () => {
  const [data, refetch] = useFetch<GetUsersResponse, Domain>('/users', {
    domains: ['users'],
  });

  if (data.fetching) {
    return <Spinner />;
  }

  if (data.error) {
    return <ErrorCard error={data.error} refetch={refetch} />;
  }

  return data.users.map(u => <UserCard user={u} />);
};
```

### Type arguments

Type arguments are optional and can be used to specify the type of data being returned (assuming a successful request) and the valid domains which can be specified.

### Arguments

#### URL

The first argument is the route for your request. You'll more than likely have already set your [baseUrl]('./Configuration.md#baseurl') so just specify the route within the API.

#### Additional options

**domains** - _The domain of the data being retrieved. This is a required array of strings and may need to be type-safe ()._

**fetchOptions (optional)** - _The [fetch 'init' argument](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) for the request. This can override globally configured options such as headers._

### Response
