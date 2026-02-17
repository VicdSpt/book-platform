export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface Book {
  id: string;
  googleBooksId: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
}

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  status: ReadingStatus;
  createdAt: string;
  updatedAt: string;
  book: Book; // Included via Prisma's include
}

export type ReadingStatus = 'READ' | 'READING' | 'TO_READ';

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Google Books API response shape
export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}