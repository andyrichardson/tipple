import { Card, Comment, Spin, Row } from 'antd';
import React, { FC, useMemo } from 'react';
import { useFetch, FetchState } from 'tipple';

export const Post: FC<{ post: PostData }> = ({ post }) => {
  const [comments] = useFetch<CommentData[], DataDomain>(
    `/comments/?postId=${post.id}`,
    { domains: ['comments'] }
  );

  const commentsContent = useMemo(() => getComments(comments), [comments]);

  return (
    <Row>
      <Card>
        <h2>{post.title}</h2>
        {commentsContent}
      </Card>
    </Row>
  );
};

const getComments = (comments: FetchState<CommentData[]>) => {
  if (comments.fetching && comments.data === undefined) {
    return <Spin />;
  }

  if (comments.error || comments.data === undefined) {
    return <p>Unable to fetch comments</p>;
  }

  return (
    <>
      <div className="ant-list-header">{comments.data.length} replies</div>
      <hr />
      {comments.data.map(comment => (
        <Comment key={comment.id} content={comment.body} />
      ))}
    </>
  );
};
