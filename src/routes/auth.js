import { Router } from 'express'
import { googleAuth, googleCallback } from '../controllers/authController.js'
import {
  isAuthenticated,
  refreshAccessToken
} from '../middleware/authMiddleware.js'

const router = Router()

router.get('/auth/google', googleAuth)
router.get('/protected-route', isAuthenticated, (req, res) => {
  res.json({ message: 'This is a protected route' })
})

export default router
