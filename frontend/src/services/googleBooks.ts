import axios from 'axios';
import type { GoogleBook } from '../types';

// Note: We use plain axios here (not our api instance)
// because this goes to Google, not our backend
const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';

export const googleBooksService = {
  async search(query: string): Promise<GoogleBook[]> {
    if (!query.trim()) return [];

    const { data } = await axios.get(GOOGLE_BOOKS_URL, {
      params: {
        q: query,
        maxResults: 20,
        printType: 'books'
      }
    });

    return data.items || [];
  }
};