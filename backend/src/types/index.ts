export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  google_books_id: string;
  title: string;
  author: string;
  cover_url?: string;
  description?: string;
  created_at: string;
}

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingStatus;
  created_at: string;
  updated_at: string;
  book?: Book; // For joined queries
}

export type ReadingStatus = 'READ' | 'READING' | 'TO_READ';