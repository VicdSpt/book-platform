import React from 'react';
import { UserBook, ReadingStatus } from '../../types';
import BookCard from './BookCard';

interface BookListProps {
  books: UserBook[];
  onStatusChange: (id: string, status: ReadingStatus) => void;
  onDelete: (id: string) => void;
}

const BookList: React.FC<BookListProps> = ({ books, onStatusChange, onDelete }) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">No books here yet</h3>
        <p className="text-gray-400 text-sm">Search for a book above to add it!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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