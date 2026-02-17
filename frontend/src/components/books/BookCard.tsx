import React, { useState } from 'react';
import { UserBook, ReadingStatus } from '../../types';

interface BookCardProps {
  userBook: UserBook;
  onStatusChange: (id: string, status: ReadingStatus) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<ReadingStatus, { label: string; color: string }> = {
  READING: { label: '📖 Currently Reading', color: 'bg-blue-100 text-blue-700' },
  TO_READ: { label: '📌 To Read', color: 'bg-yellow-100 text-yellow-700' },
  READ: { label: '✅ Already Read', color: 'bg-green-100 text-green-700' }
};

const BookCard: React.FC<BookCardProps> = ({ userBook, onStatusChange, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { book, status, id } = userBook;
  const config = statusConfig[status];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 relative hover:shadow-md transition-shadow">

      {/* Book Cover */}
      <img
        src={book.coverUrl || '/placeholder.png'}
        alt={book.title}
        className="w-16 h-24 object-cover rounded-lg flex-shrink-0 bg-gray-100"
      />

      {/* Book Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 truncate">{book.title}</h3>
        <p className="text-sm text-gray-500 mb-2 truncate">{book.author}</p>

        {/* Status Badge */}
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
          {config.label}
        </span>

        {/* Change Status Buttons */}
        <div className="flex gap-1 mt-3 flex-wrap">
          {(Object.keys(statusConfig) as ReadingStatus[])
            .filter(s => s !== status)
            .map(s => (
              <button
                key={s}
                onClick={() => onStatusChange(id, s)}
                className="text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
              >
                Move to {statusConfig[s].label}
              </button>
            ))}
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => {
          if (confirm('Remove this book from your library?')) {
            onDelete(id);
          }
        }}
        className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors text-lg"
        title="Remove book"
      >
        ×
      </button>
    </div>
  );
};

export default BookCard;