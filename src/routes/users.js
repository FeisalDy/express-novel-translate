import { Router } from 'express'
import { getUser } from '../controllers/usersController.js'

const router = Router()

router.get('/user', getUser)

export default router
