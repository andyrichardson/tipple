# FAQs

## Why should I use Tipple?

Re-implementing backend logic on the front end is currently the standard when working with REST. If you need the efficiency of fewer API calls and can deal with the consequences of additional complexity and redundancy, go for it. For everyone else, there's now an alternative that, up until this point, hasn't been around.

## Is this another fetching library?

Tipple does manage the state of requests for you... but so do many other "fetch wrappers".

The selling point here is the simple and effortless cache invalidation. You just make the requests you need and Tipple will handle refetching expired data.

## Will users notice the increase in API calls?

For anything other than extremely slow networks, it's unlikely. A typical API response will be substantially smaller in size than any other asset being requested (images, js, html, etc). For the most part, users won't even be aware that requests are being made in the background.

## Won't invalidating a domain cause potentially 100s of requests?

Fetching in Tipple is coupled to your component. If you have a _useFetch_ call within a mounted component and it's domain is invalidated, it will refetch the asset.

When working with lists of components which could make a fetch call, it's advised you use a virtualized list component such as [react-virtualized](https://github.com/bvaughn/react-virtualized). This way, only the components in view will refetch while later items will only refetch when scrolled into view.

## Can I show stale data while a refetch is taking place?

No problem, only show a loading spinner when there is no data present.

```tsx
// Show spinner only on initial fetch
if (req.fetching && req.data === undefined) {
  return <Spinner />;
}
```

## How do I find out more about how Tipple works under the hood?

There's a [blog post here](http://formidable.com/blog/2019/tipple).

## What do I do with all this spare time now that my app is less complicated?

Make your app awesome!

Do you know what end users love more than uber efficient caching? Fast delivery of features and bug fixes.

Do you know what developers love more than uber efficient caching? You guessed it - quickly delivering features and bug fixes.

Unless you really _really_ need to make as few API calls as possible, this approach will probably provide more value.
