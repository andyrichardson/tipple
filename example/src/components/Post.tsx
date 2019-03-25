import styled from 'styled-components';
import React, { FC, useMemo } from 'react';
import { Card } from './Card';
import { useFetch, FetchState } from 'takearest';

export const Post: FC<{ post: PostData }> = ({ post }) => {
  const [comments] = useFetch<CommentData[]>(
    `http://localhost:5000/comments/?postId=${post.id}`,
    { domains: ['comments'] }
  );

  const commentsContent = useMemo(() => getComments(comments), [comments]);

  return (
    <Card>
      <Title>{post.title}</Title>
      <Author>{post.author}</Author>
      {commentsContent}
    </Card>
  );
};

const getComments = (comments: FetchState<CommentData[]>) => {
  if (comments.fetching && comments.data === undefined) {
    return <p>Fetching comments</p>;
  }

  if (comments.error || comments.data === undefined) {
    return <p>Unable to fetch comments</p>;
  }

  if (comments.data.length === 0) {
    return <p>No comments.</p>;
  }

  return comments.data.map(comment => (
    <Comment key={comment.id}>{comment.body}</Comment>
  ));
};

const Title = styled.h3``;

const Author = styled.p``;

const Comment = styled.p`
  border: solid 1px #eee;
  padding: 10px;
`;
