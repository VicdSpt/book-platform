import { Request, Response } from "express";
import { Book, UserBook, ReadingStatus } from "../types";

// Temporary in-memory storage (will be replaced with database)
let books: Book[] = [];
let userBooks: UserBook[] = [];

// GET /api/books - Get all user's books
export const getAllBooks = (req: Request, res: Response) => {
  // Later: get userId from authentication
  const userId = "temp-user-id";

  // Filter books for this user
  const userBookList = userBooks.filter((ub) => ub.userId === userId);

  // Join with book details
  const booksWithStatus = userBookList.map((ub) => {
    const book = books.find((b) => b.id === ub.bookId);
    return {
      ...book,
      ...ub,
    };
  });

  res.json(booksWithStatus);
};

// GET /api/books?status=reading - Get books by status
export const getBooksByStatus = (req: Request, res: Response) => {
  const { status } = req.query;
  const userId = "temp-user-id";

  // Filter by status if provided
  let filtered = userBooks.filter((ub) => ub.userId === userId);
  if (status) {
    filtered = filtered.filter((ub) => ub.status === status);
  }

  const booksWithStatus = filtered.map((ub) => {
    const book = books.find((b) => b.id === ub.bookId);
    return { ...book, ...ub };
  });

  res.json(booksWithStatus);
};

// POST /api/books - Add a book to user's list
export const addBook = (req: Request, res: Response) => {
  const { googleBooksId, title, author, coverUrl, description, status } =
    req.body;
  const userId = "temp-user-id";

  // Validate required fields
  if (!title || !author || !status) {
    return res.status(400).json({
      error: "Missing required fields: title, author, status",
    });
  }

  // Check if book already exists
  let book = books.find((b) => b.googleBooksId === googleBooksId);

  if (!book) {
    // Create new book
    book = {
      id: `book-${Date.now()}`,
      googleBooksId,
      title,
      author,
      coverUrl,
      description,
    };
    books.push(book);
  }

  // Check if user already has this book
  const existingUserBook = userBooks.find(
    (ub) => ub.userId === userId && ub.bookId === book!.id,
  );

  if (existingUserBook) {
    return res.status(400).json({
      error: "Book already in your library",
    });
  }

  // Create user-book relationship
  const userBook: UserBook = {
    id: `ub-${Date.now()}`,
    userId,
    bookId: book.id,
    status: status as ReadingStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  userBooks.push(userBook);

  res.status(201).json({ ...book, ...userBook });
};

// PUT /api/books/:id - Update book status
export const updateBookStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = "temp-user-id";

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  const userBook = userBooks.find((ub) => ub.id === id && ub.userId === userId);

  if (!userBook) {
    return res.status(404).json({ error: "Book not found" });
  }

  userBook.status = status as ReadingStatus;
  userBook.updatedAt = new Date();

  const book = books.find((b) => b.id === userBook.bookId);
  res.json({ ...book, ...userBook });
};

// DELETE /api/books/:id - Remove book from user's list
export const deleteBook = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = "temp-user-id";

  const index = userBooks.findIndex(
    (ub) => ub.id === id && ub.userId === userId,
  );

  if (index === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  userBooks.splice(index, 1);
  res.status(204).send(); // 204 = No Content (successful deletion)
};
