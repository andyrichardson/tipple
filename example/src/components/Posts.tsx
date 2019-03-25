import React, { FC, useMemo } from 'react';
import { useFetch, FetchState } from 'takearest';
import { Post } from './Post';

export const Posts: FC = () => {
  const [posts, refetch] = useFetch<PostData[]>('/posts', {
    domains: ['posts'],
  });

  const content = useMemo(() => getContent(posts), [posts]);

  return (
    <>
      {content}
      <button onClick={refetch}>Refetch</button>
    </>
  );
};

const getContent = (posts: FetchState<PostData[]>) => {
  // First fetch
  if (posts.fetching || posts.data === undefined) {
    return <div>Fetching</div>;
  }

  // Error
  if (posts.error !== undefined) {
    return <div>Error!</div>;
  }

  // Has data (may also be fetching in background)
  return posts.data.map(post => <Post key={post.id} post={post} />);
};
