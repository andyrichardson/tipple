import { Layout } from 'antd';
import React, { FC } from 'react';
import { createClient, TippleProvider } from 'tipple';
import { Posts } from './components/Posts';
import { AddPost } from './components/AddPost';
import './main.css';

const tipple = createClient({
  baseUrl: 'http://localhost:5000',
  fetchOptions: { headers: { 'content-type': 'application/json' } },
});

export const App: FC = () => {
  return (
    <TippleProvider client={tipple}>
      <Layout.Content>
        <AddPost />
        <Posts />
      </Layout.Content>
    </TippleProvider>
  );
};
