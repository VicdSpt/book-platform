import React from 'react';
import type { UserBook, ReadingStatus } from '../../types';
import BookCard from './BookCard';
import { Library } from 'lucide-react';

interface BookListProps {
  books: UserBook[];
  onStatusChange: (id: string, status: ReadingStatus) => void;
  onDelete: (id: string) => void;
}

const BookList: React.FC<BookListProps> = ({ books, onStatusChange, onDelete }) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Library className="w-7 h-7 text-gray-300" />
        </div>
        <h3 className="text-base font-medium text-gray-600 mb-1">No books here yet</h3>
        <p className="text-gray-400 text-sm">Search for a book above to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map(userBook => (
        <BookCard
          key={userBook.id}
          userBook={userBook}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BookList;
