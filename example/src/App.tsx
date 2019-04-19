import { Layout } from 'antd';
import React, { FC } from 'react';
import { TippleProvider } from 'tipple';
import { Posts } from './components/Posts';
import { AddPost } from './components/AddPost';
import './main.css';

export const App: FC = () => {
  return (
    <TippleProvider
      headers={{ 'content-type': 'application/json' }}
      baseUrl={process.env.API_ROUTE}
    >
      <Layout.Content>
        <AddPost />
        <Posts />
      </Layout.Content>
    </TippleProvider>
  );
};
