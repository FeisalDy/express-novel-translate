import { Router } from 'express'
import {
  getChapterById,
  createChapter,
  updateChapterById,
  deleteChapterById
} from '../controllers/chapterController.js'

const router = Router()

router.get('/chapters/:id', getChapterById)
router.post('/chapters', createChapter)
router.patch('/chapters/:id', updateChapterById)
router.delete('/chapters/:id', deleteChapterById)

export default router
