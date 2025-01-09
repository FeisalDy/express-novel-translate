import { Router } from 'express'
import {
  getBookIdForSiteMap,
  getChapterIdForSiteMap
} from '../controllers/siteMapControllers.js'

const router = Router()

router.get('/sitemap/book/:id', getBookIdForSiteMap)
router.get('/sitemap/chapter/:id', getChapterIdForSiteMap)

export default router
