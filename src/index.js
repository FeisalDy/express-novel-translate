import express from 'express'
import dotenv from 'dotenv'
import router from './routes/index.js'
import cors from 'cors'
import { sessionMiddleware } from './middleware/sessionMiddleware.js'
dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(sessionMiddleware)

app.use(router)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

app.get('/', (req, res) => {
  return res.send(req.session)
})
