import { Card, Button, Input, Row, Col } from 'antd';
import React, { useState, useCallback } from 'react';
import { useFetch } from 'tipple';
// import { Card } from './Card';

export const AddPost = () => {
  const [body, setBody] = useState<any>({ author: 'user', title: '' });
  const [response, addPost] = useFetch(
    '/posts',
    { domains: ['posts'] },
    { method: 'POST', body: JSON.stringify(body) }
  );

  const handleInput = useCallback(
    (e: any) => setBody({ ...body, title: e.target.value }),
    [body]
  );

  return (
    <Row>
      <Card>
        <Row gutter={8}>
          <Col span={19}>
            <Input
              placeholder={'Enter a post'}
              value={body.title}
              onChange={handleInput}
            />
          </Col>
          <Col span={5}>
            <Button type="primary" onClick={addPost}>
              Add post
            </Button>
          </Col>
        </Row>
      </Card>
    </Row>
  );
};
