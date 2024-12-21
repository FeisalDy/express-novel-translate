import { Router } from 'express'
import {
  getBooks,
  getBookById,
  createBook,
  updateBookById,
  deleteBookById
} from '../controllers/bookController.js'
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = Router()

router.get('/books', getBooks)
router.get('/books/:id', getBookById)
router.post('/books', upload.single('cover'), createBook)
router.patch('/books/:id', upload.single('cover'), updateBookById)
router.delete('/books/:id', deleteBookById)

export default router
