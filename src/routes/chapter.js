import { Router } from 'express'
import {
  getChapterByIdOrBookIdAndChapterNumber,
  createChapter,
  updateChapterById,
  deleteChapterById,
  deleteChaptersByBookId
} from '../controllers/chapterController.js'
import multer from 'multer'

const upload = multer({ dest: 'uploads/' })

const router = Router()

router.get('/chapters/:id', getChapterByIdOrBookIdAndChapterNumber)
router.post('/chapters', upload.single('file'), createChapter)
router.patch('/chapters/:id', updateChapterById)
router.delete('/chapters/:id', deleteChapterById)
router.delete('/chapters/book/:bookId', deleteChaptersByBookId)
export default router
