import React, { useState, useEffect, useRef } from 'react';
import { googleBooksService } from '../../services/googleBooks';
import { booksService } from '../../services/books';
import type { GoogleBook, UserBook, ReadingStatus } from '../../types';
import { Search, Loader2, BookOpen, Bookmark, CheckCircle, Check } from 'lucide-react';

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);

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
    }, 500);

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

  const isBookAdded = (googleBookId: string): boolean => {
    return existingBooks.some(ub => ub.book.google_books_id === googleBookId);
  };

  const statusButtons: { status: ReadingStatus; icon: React.ReactNode; label: string }[] = [
    { status: 'READING', icon: <BookOpen className="w-3 h-3" />, label: 'Reading' },
    { status: 'TO_READ', icon: <Bookmark className="w-3 h-3" />, label: 'To Read' },
    { status: 'READ', icon: <CheckCircle className="w-3 h-3" />, label: 'Read' },
  ];

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book to add..."
          className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 shadow-sm transition-all duration-200"
        />
        {searching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin-slow" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/60 z-50 max-h-100 overflow-y-auto animate-fade-in">
          {results.map(book => (
            <div
              key={book.id}
              className="flex items-start gap-3 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
            >
              {/* Cover */}
              <img
                src={book.volumeInfo.imageLinks?.smallThumbnail || '/placeholder.png'}
                alt={book.volumeInfo.title}
                className="w-10 h-14 object-cover rounded-lg shrink-0 bg-gray-100"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {book.volumeInfo.title}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                </p>
              </div>

              {/* Actions */}
              {isBookAdded(book.id) ? (
                <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg whitespace-nowrap shrink-0 border border-emerald-100">
                  <Check className="w-3 h-3" />
                  Added
                </span>
              ) : (
                <div className="flex flex-col gap-1 shrink-0">
                  {statusButtons.map(({ status, icon, label }) => (
                    <button
                      key={status}
                      onClick={() => handleAddBook(book, status)}
                      disabled={addingId === book.id}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-900 hover:text-white transition-all duration-200 disabled:opacity-50 whitespace-nowrap"
                    >
                      {addingId === book.id ? (
                        <Loader2 className="w-3 h-3 animate-spin-slow" />
                      ) : (
                        icon
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Close overlay */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default BookSearch;
