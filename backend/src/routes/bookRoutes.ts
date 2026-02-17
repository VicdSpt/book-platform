import { Router } from 'express';
import {
  getAllBooks,
  getBooksByStatus,
  addBook,
  updateBookStatus,
  deleteBook
} from '../controllers/bookController';

const router = Router();

// Define routes
router.get('/books', getAllBooks);
router.post('/books', addBook);
router.put('/books/:id', updateBookStatus);
router.delete('/books/:id', deleteBook);

export default router;