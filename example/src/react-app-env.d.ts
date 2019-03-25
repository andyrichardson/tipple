/// <reference types="react-scripts" />

interface PostData {
  id: number;
  author: string;
  title: string;
}

interface CommentData {
  id: number;
  body: string;
  postId: number;
}
