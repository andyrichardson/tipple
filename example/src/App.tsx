import { Layout, Spin } from 'antd';
import React, { FC, Suspense, lazy } from 'react';
import { createClient, TippleProvider } from 'tipple';
import { AddPost } from './components/AddPost';
import './main.css';

export const tipple = createClient({
  baseUrl: 'http://localhost:5000',
  fetchOptions: { headers: { 'Content-Type': 'application/json' } },
});

const Posts = lazy(() => import('./components/Posts'));

export const App: FC = () => {
  return (
    <TippleProvider client={tipple}>
      <Layout.Content>
        <AddPost />
        <Suspense fallback={<Spin size="large" />}>
          <Posts />
        </Suspense>
      </Layout.Content>
    </TippleProvider>
  );
};
