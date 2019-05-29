import { Spin, Button } from 'antd';
import React, { FC } from 'react';
import { useFetch } from 'tipple';
import { Post } from './Post';

export const Posts: FC = () => {
  const [posts, refetch] = useFetch<PostData[], DataDomain>('/posts', {
    domains: ['posts'],
  });

  if (posts.fetching && posts.data === undefined) {
    return (
      <div style={{ textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (posts.error !== undefined || posts.data === undefined) {
    return <div>Error!</div>;
  }

  return (
    <>
      {posts.data.slice().reverse().map(post => (
        <Post key={post.id} post={post} />
      ))}
      <Button onClick={refetch}>Refetch</Button>
    </>
  );
};
