import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useFetch } from 'takearest';
import { Card } from './Card';

export const AddPost = () => {
  const [body, setBody] = useState<any>({ author: 'rested user', title: '' });
  const [response, addPost] = useFetch(
    'http://localhost:5000/posts',
    { domains: ['posts'] },
    { method: 'POST', body: JSON.stringify(body) }
  );

  const handleInput = useCallback(
    (e: any) => setBody({ ...body, title: e.target.value }),
    [body]
  );

  return (
    <Card>
      <label>Title</label>
      <input value={body.title} onChange={handleInput} />

      <button onClick={addPost}>Submit</button>
    </Card>
  );
};

const Form = styled.form``;
