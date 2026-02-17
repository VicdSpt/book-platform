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
  status: 'read' | 'reading' | 'to-read';
  createdAt: Date;
  updatedAt: Date;
}

export type ReadingStatus = 'read' | 'reading' | 'to-read';