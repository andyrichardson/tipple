import { Spin, Button } from 'antd';
import React, { FC } from 'react';
import {
  useFetch,
  preloadFetch,
  TippleContext,
  usePreloadedFetch,
} from 'tipple';
import { Post } from './Post';
import { tipple } from '../App';
import { useContext } from 'react';

const preloadedPosts = preloadFetch<PostData[]>(tipple, '/posts');
// posts: tipple.executeRequest<PostData[]>('/posts'),
// };

export const Posts: FC = () => {
  // return <h1>posts</h1>;
  const response = usePreloadedFetch(preloadedPosts, {
    domains: ['post'],
    cachePolicy: 'cache-only',
  });

  console.log(clearDomains);

  console.log(response.data);
  return (
    <>
      {response.data
        .slice()
        .reverse()
        .map(post => (
          <Post key={post.id} post={post} />
        ))}
    </>
  );
};
export default Posts;
