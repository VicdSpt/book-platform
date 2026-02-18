import { Router } from 'express';
import {
  getAllBooks,
  addBook,
  updateBookStatus,
  deleteBook
} from '../controllers/bookController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authenticate middleware to ALL routes
router.use(authenticate);

router.get('/books', getAllBooks);
router.post('/books', addBook);
router.put('/books/:id', updateBookStatus);
router.delete('/books/:id', deleteBook);

export default router;