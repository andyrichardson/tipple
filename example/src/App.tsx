import React, { FC } from 'react';
import { TakeAProvider } from 'takearest';
import { Posts } from './components/Posts';
import { AddPost } from './components/AddPost';

export const App: FC = () => {
  return (
    <TakeAProvider baseUrl={'http://localhost:5000'}>
      <AddPost />
      <Posts />
    </TakeAProvider>
  );
};
