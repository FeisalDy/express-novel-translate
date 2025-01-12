import { Router } from 'express'
import {
  getBooks,
  getBookById,
  createBook,
  updateBookById,
  deleteBookById
} from '../controllers/bookController.js'
import multer from 'multer'
import { isAuthenticated } from '../middleware/authMiddleware.js'

// const storage = multer.memoryStorage()
// const upload = multer({ storage: storage })

//upload image bia multer and save in diskstorage with correct name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}.jpg`)
  }
})

const upload = multer({ storage: storage })

const router = Router()

router.use((req, res, next) => {
  if (req.method !== 'GET') {
    return isAuthenticated(req, res, next)
  }
  //   isAuthenticated(req, res, next)
  next()
})

router.get('/books', getBooks)
router.get('/books/:id', getBookById)
router.post('/books', upload.single('cover'), createBook)
router.patch('/books/:id', upload.single('cover'), updateBookById)
router.delete('/books/:id', deleteBookById)

export default router
