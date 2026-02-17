import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { ReadingStatus } from '../types';

// ─── GET /api/books ──────────────────────────────────────
export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const userId = "88ff3cc4-ffd3-4386-9b79-d6ffd855705e";

    const { data: userBooks, error } = await supabase
      .from('user_books')
      .select(`
        *,
        book:books(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(userBooks);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

// ─── POST /api/books ─────────────────────────────────────
export const addBook = async (req: Request, res: Response) => {
  try {
    const { googleBooksId, title, author, coverUrl, description, status } = req.body;
    const userId = "88ff3cc4-ffd3-4386-9b79-d6ffd855705e";

    // Validate
    if (!googleBooksId || !title || !author || !status) {
      return res.status(400).json({
        error: 'Missing required fields: googleBooksId, title, author, status'
      });
    }

    // Find or create book
    let { data: book } = await supabase
      .from('books')
      .select('*')
      .eq('google_books_id', googleBooksId)
      .single();

    if (!book) {
      const { data: newBook, error } = await supabase
        .from('books')
        .insert({
          google_books_id: googleBooksId,
          title,
          author,
          cover_url: coverUrl,
          description
        })
        .select()
        .single();

      if (error) throw error;
      book = newBook;
    }

    // Check if user already has this book
    const { data: existing } = await supabase
      .from('user_books')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', book.id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Book already in your library' });
    }

    // Add to user's library
    const { data: userBook, error: insertError } = await supabase
      .from('user_books')
      .insert({
        user_id: userId,
        book_id: book.id,
        status: status as ReadingStatus
      })
      .select(`
        *,
        book:books(*)
      `)
      .single();

    if (insertError) throw insertError;

    res.status(201).json(userBook);
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
};

// ─── PUT /api/books/:id ──────────────────────────────────
export const updateBookStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = "88ff3cc4-ffd3-4386-9b79-d6ffd855705e";

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Verify ownership
    const { data: userBook } = await supabase
      .from('user_books')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!userBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Update status
    const { data: updated, error } = await supabase
      .from('user_books')
      .update({ status: status as ReadingStatus })
      .eq('id', id)
      .select(`
        *,
        book:books(*)
      `)
      .single();

    if (error) throw error;

    res.json(updated);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book status' });
  }
};

// ─── DELETE /api/books/:id ───────────────────────────────
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = "88ff3cc4-ffd3-4386-9b79-d6ffd855705e";

    // Verify ownership
    const { data: userBook } = await supabase
      .from('user_books')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!userBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
};