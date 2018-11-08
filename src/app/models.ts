

export interface GithubApi {
  items: GithubIssue[];
  total_count: number;
}

export interface GithubIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}

// https://jsonplaceholder.typicode.com/comments

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

