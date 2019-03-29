import { Card, Button, Input, Row, Col } from 'antd';
import React, { useState, useCallback } from 'react';
import { usePush } from 'tipple';

export const AddPost = () => {
  const [body, setBody] = useState<any>({ author: 'user', title: '' });
  const [response, addPost] = usePush('/posts', {
    domains: ['posts'],
    fetchOptions: { method: 'POST', body: JSON.stringify(body) },
  });

  console.log(response);
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
            {/* 
            // @ts-ignore */}
            <Button type="primary" onClick={addPost}>
              Add post
            </Button>
          </Col>
        </Row>
      </Card>
    </Row>
  );
};
