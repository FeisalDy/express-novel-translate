import { Router } from 'express'
import UserRouter from './users.js'
import BookRouter from './books.js'
import ChapterRouter from './chapters.js'

const router = Router()

router.use('/api', UserRouter)
router.use('/api', BookRouter)
router.use('/api', ChapterRouter)

export default router
