import React from 'react';
import type { UserBook, ReadingStatus } from '../../types';
import { BookOpen, Bookmark, CheckCircle, X, ArrowRight } from 'lucide-react';

interface BookCardProps {
  userBook: UserBook;
  onStatusChange: (id: string, status: ReadingStatus) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<ReadingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  READING: {
    label: 'Reading',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: <BookOpen className="w-3 h-3" />
  },
  TO_READ: {
    label: 'To Read',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    icon: <Bookmark className="w-3 h-3" />
  },
  READ: {
    label: 'Finished',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: <CheckCircle className="w-3 h-3" />
  }
};

const BookCard: React.FC<BookCardProps> = ({ userBook, onStatusChange, onDelete }) => {
  const { book, status, id } = userBook;
  const config = statusConfig[status];

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 relative hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-300 animate-fade-in">

      {/* Book Cover */}
      <img
        src={book.cover_url || '/placeholder.png'}
        alt={book.title}
        className="w-20 h-28 object-cover rounded-xl shrink-0 bg-gray-100"
      />

      {/* Book Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="font-semibold text-gray-900 truncate text-sm">{book.title}</h3>
        <p className="text-xs text-gray-400 mb-2 truncate">{book.author}</p>

        {book.description && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        )}

        {/* Status Badge */}
        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium border ${config.color}`}>
          {config.icon}
          {config.label}
        </span>

        {/* Change Status */}
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {(Object.keys(statusConfig) as ReadingStatus[])
            .filter(s => s !== status)
            .map(s => (
              <button
                key={s}
                onClick={() => onStatusChange(id, s)}
                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg transition-all duration-200"
              >
                <ArrowRight className="w-3 h-3" />
                {statusConfig[s].label}
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
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
        title="Remove book"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default BookCard;
