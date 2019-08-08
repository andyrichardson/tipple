# Hooks

Hooks are going to be the interface between you and your Graphql API. Currently there are two types of hook `useFetch` and `usePush`.

> Before diving into this section, it's advised that you take a look at how [domains](./Domains.md) and [configuration](./Configuration.md) work in Tipple.

## useFetch

This is your go-to interface for information retrieval (`GET` requests). Below is an example of a component using `useFetch` which retrieves a collection of users.

By default, the request for `useFetch` will be executed immediately. Subsequent requests can be triggered via the refetch function (below) or from triggering a `usePush` operation to any of the specified domains.

```tsx
import { useFetch } from 'tipple';
import { GetUsersResponse, Domain } from './types';
import { ErrorCard, Spinner, UserCard } from './components';

export const Users: FC = () => {
  const [req, refetch] = useFetch<GetUsersResponse, Domain>('/users', {
    domains: ['users'],
  });

  if (req.fetching) {
    return <Spinner />;
  }

  if (req.error) {
    return <ErrorCard error={data.error} refetch={refetch} />;
  }

  return req.data.users.map(u => <UserCard user={u} />);
};
```

### Type arguments

Type arguments are optional but advised.

`T`: The type of data being returned from the hook assuming a successful response.

`D`: The valid domains which can be passed to the `domains` argument.

### Arguments

#### URL

The first argument is the route for your request. You'll more than likely have already set your [baseUrl](./Configuration.md#baseurl) so just specify the route within the API.

#### Additional options

##### domains

The domain of the data being retrieved. This is a required array of strings which may need to [comply to a domain type](#type-arguments).

##### cachePolicy

The way in which data is retrieved from the cache or network:

- _cache-first (default)_ - cached data is returned and the fetch request is triggered.
- _network-first_ - cached data is not returned until the fetch request returns and the cache is updated.
- _cache-only_ - cached data is returned and no network request is made.
- _network-only_ - the request is made in isolation and there is no attachment to the cache.

> Note: When using the _network-only_ cache policy, you will not be able to specify a domain as the cache is not being used.

##### autoFetch

Whether the fetch should automatically be triggered on initial mount and whenever arguments change (defaults to true).

##### fetchOptions

The [fetch 'init' argument](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) for the request. This can override globally configured options.

##### parseResponse

Expects a function which receives the API response and returns a parsed value of type `T`.

> Note: The argument to the parser should be casted in order to ensure type safety (e.g. `parseResponse: (arg: ApiResponse) => arg[0]`).

##### baseUrl

An optional baseUrl which overrides the default given to the provider.

### Response

If this is your first time working with hooks, we advise that you take a look at the [official documentation](https://reactjs.org/docs/hooks-state.html) before moving forward. The below examples are documented in the order that they are returned (e.g. `[request, refetch]`).

#### [request, ...]

An object containing metadata about the network request and the resulting response. The properties are as follows.

##### fetching

Whether or not a fetch request is in-flight.

##### error

The resulting error in the case where the request has failed.

##### data

The parsed JSON response from the server assuming the request was successful.

#### [..., refetch]

No surprises here, this function will re-execute the API call and update the state of your data.

> Note: This is only for a manual refetch, remember that a refetch will occur whenever the domain is invalidated.

## usePush

This is used for pushing changes which to the server (methods such as `POST`, `PATCH`, `DELETE` .etc). Below is an example of a component using `usePush` to add a comment to a post.

```tsx
import { usePush } from 'tipple';
import { AddCommentResponse, Domain } from './types';
import { Spinner } from './components';

export const AddComment: FC = () => {
  const [inputState, setState] = useState('');
  const [req, execute, clear] = usePush<AddCommentResponse, Domain>(
    '/posts/1/comments',
    {
      domains: ['comments'],
      fetchOptions: {
        method: 'POST',
        body: JSON.stringify(inputState),
      },
    }
  );

  if (req.fetching) {
    return <Spinner />;
  }

  if (req.error) {
    alert('Unable to add comment');
    clear();
  }

  if (req.data) {
    alert('Comment successfully added');
    clear();
  }

  return (
    <>
      <input value={inputState} onChange={e => setState(e.target.value)} />
      <button onClick={execute}>Add comment</button>
    </>
  );
};
```

> Note: On completion, any data dependent on the specified domain will be refetched.

### Type arguments

Type arguments are optional and can be used to specify the type of data being returned (assuming a successful request) and the valid domains which can be specified.

### Arguments

#### URL

The endpoint URL (as [described for useFetch](#Arguments)).

#### Additional options

All the arguments for `usePush` are identical to that of `useFetch` with the exception of `cachePolicy`, `autoFetch` and `parseResponse`.

### Response

The below examples are documented in the order that they are returned (e.g. `[request, execute]`).

#### [request, ...]

See the request definition for [useFetch](#Response).

#### [..., execute]

This function triggers API call and updates the request state with fetching, response and error values. The execute function also returns a promise for use-cases where an immediate side-effect needs to be triggered.

> Note: For most use cases, we've found it makes more sense to use `execute` and `clear` functions rather than the async functionality.

#### [..., ..., clear]

Clears request object back to its initial state. Triggering this will often be useful following the handling of an error/response data.
