import api from './api';
import { UserBook, ReadingStatus } from '../types';

export const booksService = {
  async getUserBooks(): Promise<UserBook[]> {
    const { data } = await api.get<UserBook[]>('/books');
    return data;
  },

  async addBook(bookData: {
    googleBooksId: string;
    title: string;
    author: string;
    coverUrl?: string;
    description?: string;
    status: ReadingStatus;
  }): Promise<UserBook> {
    const { data } = await api.post<UserBook>('/books', bookData);
    return data;
  },

  async updateBookStatus(id: string, status: ReadingStatus): Promise<UserBook> {
    const { data } = await api.put<UserBook>(`/books/${id}`, { status });
    return data;
  },

  async deleteBook(id: string): Promise<void> {
    await api.delete(`/books/${id}`);
  }
};