import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { booksService } from '../services/books';
import { UserBook, ReadingStatus } from '../types';
import BookSearch from '../components/books/BookSearch';
import BookList from '../components/books/BookList';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReadingStatus | 'ALL'>('ALL');

  // Load user's books on mount
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

  // Called when user adds a book from search
  const handleBookAdded = (newBook: UserBook) => {
    setUserBooks(prev => [newBook, ...prev]);
  };

  // Called when user changes reading status
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

  // Called when user deletes a book
  const handleDelete = async (id: string) => {
    try {
      await booksService.deleteBook(id);
      setUserBooks(prev => prev.filter(book => book.id !== id));
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  // Filter books by active tab
  const filteredBooks = activeTab === 'ALL'
    ? userBooks
    : userBooks.filter(b => b.status === activeTab);

  // Count books per category for tab badges
  const counts = {
    ALL: userBooks.length,
    READING: userBooks.filter(b => b.status === 'READING').length,
    TO_READ: userBooks.filter(b => b.status === 'TO_READ').length,
    READ: userBooks.filter(b => b.status === 'READ').length
  };

  const tabs: { label: string; value: ReadingStatus | 'ALL' }[] = [
    { label: 'All Books', value: 'ALL' },
    { label: 'Currently Reading', value: 'READING' },
    { label: 'To Read', value: 'TO_READ' },
    { label: 'Already Read', value: 'READ' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📚 My Books</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Search Section ── */}
        <div className="mb-8">
          <BookSearch
            onBookAdded={handleBookAdded}
            existingBooks={userBooks}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${activeTab === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              {tab.label}
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${activeTab === tab.value ? 'bg-blue-500' : 'bg-gray-100 text-gray-500'}
              `}>
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Book List ── */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading your books...</div>
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