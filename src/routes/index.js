import { Router } from 'express'
import AuthRouter from './auth.js'
import BookRouter from './book.js'
import ChapterRouter from './chapter.js'
import SiteMapRouter from './siteMap.js'

// import {}
import { googleCallback } from '../controllers/authController.js'
const router = Router()

router.use('/api', AuthRouter)
router.use('/api', BookRouter)
router.use('/api', ChapterRouter)
router.use('/api', SiteMapRouter)

router.get('/auth/google/callback', googleCallback)

export default router
