import prisma from '../utils/db.js'
import axios from 'axios'

function buildWhereClause ({ title, author, wordCount, tags }) {
  let whereClause = {}
  const conditions = [
    { field: 'title', value: title },
    { field: 'cn_title', value: title },
    { field: 'author', value: author },
    { field: 'cn_author', value: author }
  ]

  for (const { field, value } of conditions) {
    if (value) {
      whereClause.OR = whereClause.OR || []
      whereClause.OR.push({
        [field]: {
          contains: value,
          mode: 'insensitive'
        }
      })
    }
  }

  if (wordCount) {
    whereClause.wordCount = parseInt(wordCount)
  }

  if (tags) {
    whereClause.tags = {
      hasSome: tags.split(',')
    }
  }

  return whereClause
}

function mapBookData (body, file) {
  const data = {}

  if (body.title) data.title = body.title
  if (body.cn_title) data.cn_title = body.cn_title
  if (body.author) data.author = body.author
  if (body.cn_author) data.cn_author = body.cn_author
  if (body.wordCount) data.wordCount = parseInt(body.wordCount, 10)
  if (body.isCompleted)
    data.isCompleted = body.isCompleted === 'true' ? true : false
  if (body.tags) data.tags = body.tags.split(',').map(tag => tag.trim())
  if (file) data.cover = file

  return data
}

async function uploadImage (file) {
  try {
    const buffer = file.buffer
    const base64string = buffer.toString('base64')

    const formData = new FormData()
    formData.append('image', base64string)

    const apiKey = process.env.IMGBB_API_KEY
    const url = `https://api.imgbb.com/1/upload?key=${apiKey}`
    const response = await axios.post(url, formData)

    if (response.data.success) {
      return response.data.data.url
    } else {
      throw new Error('Image upload failed')
    }
  } catch (error) {
    console.error('Image upload error:', error.message)
    throw new Error('Image upload failed')
  }
}

export async function getBooks (req, res) {
  const { page = 1, limit = 10, title, author, wordCount, tags } = req.query

  try {
    const whereClause = buildWhereClause({ title, author, wordCount, tags })

    const totalBooks = await prisma.book.count({ where: whereClause })
    const books = await prisma.book.findMany({
      where: whereClause,
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: { id: 'desc' }
    })

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalBooks / parseInt(limit)),
      totalItems: totalBooks
    }

    return res.json({
      message: 'Fetch Books Success',
      data: books || [],
      pagination: pagination || {}
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({
      message: 'An unexpected error occurred. Please try again later.'
    })
  }
}

export async function getBookById (req, res) {
  const { id } = req.params

  if (isNaN(id)) {
    return res.status(400).json({
      message: 'Invalid book ID',
      book: {}
    })
  }

  try {
    const book = await prisma.book.findUnique({
      include: {
        chapters: {
          select: { id: true, chapterNumber: true, chapterTitle: true }
        }
      },
      where: { id: Number(id) }
    })

    if (!book) {
      return res.status(404).json({
        message: 'Book not found',
        book: {}
      })
    }

    return res.json({
      message: 'Fetch Book Success',
      data: book
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({
      message: 'An unexpected error occurred. Please try again later.'
    })
  }
}

export async function createBook (req, res) {
  const { title, author, wordCount, tags } = req.body

  if (!title || !author || !wordCount || !tags) {
    return res
      .status(400)
      .json({ message: 'title, author, wordCount, tags cannot be empty' })
  }

  try {
    let cover = null

    if (req.file) {
      cover = await uploadImage(req.file)
    }

    const bookData = mapBookData(req.body, cover)

    const book = await prisma.book.create({
      data: bookData
    })

    return res.status(201).json({
      message: 'Create Book Success',
      data: book
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}

export async function updateBookById (req, res) {
  const { id } = req.params

  if (isNaN(id)) {
    return res.status(400).json({
      message: 'Invalid book ID'
    })
  }

  try {
    let cover = undefined

    if (req.file) {
      cover = await uploadImage(req.file)
    }

    const updateData = {
      ...mapBookData(req.body, cover),
      updatedAt: new Date()
    }

    const book = await prisma.book.update({
      where: { id: Number(id) },
      data: updateData
    })

    return res.json({
      message: 'Update Book Success',
      data: book
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}

export async function deleteBookById (req, res) {
  const { id } = req.params

  if (isNaN(id)) {
    return res.status(400).json({
      message: 'Invalid book ID'
    })
  }

  try {
    await prisma.book.delete({
      where: { id: Number(id) }
    })

    return res.json({
      message: 'Delete Book Success'
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}
