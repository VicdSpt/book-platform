import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { booksService } from '../services/books';
import type { UserBook, ReadingStatus } from '../types';
import BookSearch from '../components/books/BookSearch';
import BookList from '../components/books/BookList';
import { BookOpen, LogOut, Loader2 } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReadingStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const books = await booksService.getUserBooks();
      setUserBooks(books);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAdded = (newBook: UserBook) => {
    setUserBooks(prev => [newBook, ...prev]);
  };

  const handleStatusChange = async (id: string, status: ReadingStatus) => {
    try {
      const updated = await booksService.updateBookStatus(id, status);
      setUserBooks(prev =>
        prev.map(book => book.id === id ? updated : book)
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await booksService.deleteBook(id);
      setUserBooks(prev => prev.filter(book => book.id !== id));
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const filteredBooks = activeTab === 'ALL'
    ? userBooks
    : userBooks.filter(b => b.status === activeTab);

  const counts = {
    ALL: userBooks.length,
    READING: userBooks.filter(b => b.status === 'READING').length,
    TO_READ: userBooks.filter(b => b.status === 'TO_READ').length,
    READ: userBooks.filter(b => b.status === 'READ').length
  };

  const tabs: { label: string; value: ReadingStatus | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Reading', value: 'READING' },
    { label: 'To Read', value: 'TO_READ' },
    { label: 'Finished', value: 'READ' }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight leading-tight">My Books</h1>
              <p className="text-xs text-gray-400">Welcome, {user?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Search */}
        <div className="mb-8 animate-fade-in-up">
          <BookSearch
            onBookAdded={handleBookAdded}
            existingBooks={userBooks}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                ${activeTab === tab.value
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {tab.label}
              <span className={`
                text-xs px-1.5 py-0.5 rounded-md font-normal
                ${activeTab === tab.value ? 'bg-white/20 text-white/80' : 'bg-gray-100 text-gray-400'}
              `}>
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Book List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin-slow" />
            <span className="text-sm">Loading your library...</span>
          </div>
        ) : (
          <BookList
            books={filteredBooks}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
};

export default HomePage;
