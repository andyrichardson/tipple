import React, { FC } from 'react';
import { TippleProvider } from 'tipple';
import { Posts } from './components/Posts';
import { AddPost } from './components/AddPost';

export const App: FC = () => {
  return (
    <TippleProvider baseUrl={'http://localhost:5000'}>
      <AddPost />
      <Posts />
    </TippleProvider>
  );
};
