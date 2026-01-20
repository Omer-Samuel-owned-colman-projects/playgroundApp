export type PostData = {
  content: string;
  sender: string;
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CommentData = {
  message: string;
  sender: string;
  postId: string;
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserData = {
  email: string;
  password: string;
  _id?: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export var postsData: PostData[] = [
  { content: 'Post 1', sender: 'user1' },
  { content: 'Post 2', sender: 'user2' },
  { content: 'Post 3', sender: 'user1' },
];

export var commentsData: CommentData[] = [
  { message: 'Comment 1', sender: 'user1', postId: 'post1' },
  { message: 'Comment 2', sender: 'user2', postId: 'post1' },
  { message: 'Not bad.', sender: 'user1', postId: 'post2' },
  { message: 'Could be better.', sender: 'user3', postId: 'post2' },
];

export var usersData: UserData[] = [
  { email: 'test@example.com', password: 'password123' },
];