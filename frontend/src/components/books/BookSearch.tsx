import React, { useState, useEffect, useRef } from 'react';
import { googleBooksService } from '../../services/googleBooks';
import { booksService } from '../../services/books';
import { GoogleBook, UserBook, ReadingStatus } from '../../types';

interface BookSearchProps {
  onBookAdded: (book: UserBook) => void;
  existingBooks: UserBook[];
}

const BookSearch: React.FC<BookSearchProps> = ({ onBookAdded, existingBooks }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Theory: Debouncing
  // Without debouncing: API called on every keystroke ("H", "Ha", "Har", "Harr"...)
  // With debouncing: API called only after user stops typing for 500ms
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Clear previous timer
    clearTimeout(debounceRef.current);

    // Set new timer
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const books = await googleBooksService.search(query);
        setResults(books);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    }, 500); // Wait 500ms after last keystroke

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleAddBook = async (googleBook: GoogleBook, status: ReadingStatus) => {
    setAddingId(googleBook.id);
    try {
      const newBook = await booksService.addBook({
        googleBooksId: googleBook.id,
        title: googleBook.volumeInfo.title,
        author: googleBook.volumeInfo.authors?.join(', ') || 'Unknown Author',
        coverUrl: googleBook.volumeInfo.imageLinks?.thumbnail,
        description: googleBook.volumeInfo.description,
        status
      });

      onBookAdded(newBook);
      setQuery('');
      setResults([]);
      setShowResults(false);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add book');
    } finally {
      setAddingId(null);
    }
  };

  // Check if book is already in user's library
  const isBookAdded = (googleBookId: string): boolean => {
    return existingBooks.some(ub => ub.book.googleBooksId === googleBookId);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book to add..."
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
          🔍
        </span>
        {searching && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            Searching...
          </span>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.map(book => (
            <div
              key={book.id}
              className="flex items-start gap-3 p-4 border-b border-gray-100 last:border-0"
            >
              {/* Book Cover */}
              <img
                src={book.volumeInfo.imageLinks?.smallThumbnail || '/placeholder.png'}
                alt={book.volumeInfo.title}
                className="w-10 h-14 object-cover rounded flex-shrink-0 bg-gray-100"
              />

              {/* Book Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {book.volumeInfo.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                </p>
              </div>

              {/* Add Button or Already Added Badge */}
              {isBookAdded(book.id) ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                  ✓ Added
                </span>
              ) : (
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {(['READING', 'TO_READ', 'READ'] as ReadingStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => handleAddBook(book, status)}
                      disabled={addingId === book.id}
                      className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {addingId === book.id ? '...' : statusLabel(status)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

// Helper: readable status labels
const statusLabel = (status: ReadingStatus): string => {
  const labels: Record<ReadingStatus, string> = {
    READING: '📖 Reading',
    TO_READ: '📌 To Read',
    READ: '✅ Read'
  };
  return labels[status];
};

export default BookSearch;