import prisma from '../utils/db.js'
import axios from 'axios'
import streamifier from 'streamifier'
import fs from 'fs'
import FormData from 'form-data'

// function buildWhereClause ({ title, author, wordCount, tags }) {
//   let whereClause = {}
//   const conditions = [
//     { field: 'title', value: title },
//     { field: 'cn_title', value: title },
//     { field: 'author', value: author },
//     { field: 'cn_author', value: author }
//   ]

//   for (const { field, value } of conditions) {
//     if (value) {
//       whereClause.OR = whereClause.OR || []
//       whereClause.OR.push({
//         [field]: {
//           contains: value,
//           mode: 'insensitive'
//         }
//       })
//     }
//   }

//   if (wordCount) {
//     whereClause.wordCount = parseInt(wordCount)
//   }

//   if (tags) {
//     whereClause.tags = {
//       hasSome: tags.split(',')
//     }
//   }

//   return whereClause
// }

function buildWhereClause ({ keyword, type, wordCount, tags }) {
  let whereClause = {}

  const searchableFields = {
    title: ['title', 'cn_title'],
    author: ['author', 'cn_author'],
    tags: ['tags']
  }

  // Handle keyword-based search
  if (keyword && type && searchableFields[type]) {
    if (type === 'tags') {
      const keywords = keyword.split(',').map(k => k.trim())
      whereClause.tags = {
        hasSome: keywords
      }
    } else {
      whereClause.OR = searchableFields[type].map(field => ({
        [field]: {
          contains: keyword,
          mode: 'insensitive'
        }
      }))
    }
  }

  // Add additional filters
  if (wordCount) {
    whereClause.wordCount = parseInt(wordCount)
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
  //handle if body tags is just empty string or array
  if (body.tags) {
    if (Array.isArray(body.tags)) {
      data.tags = body.tags
    } else if (body.tags === '') {
      data.tags = []
    } else {
      data.tags = body.tags.split(',')
    }
  }
  if (body.description) data.description = body.description
  if (file) data.cover = file

  return data
}

async function uploadImage (file) {
  try {
    const formData = new FormData()

    formData.append('file', fs.createReadStream(file.path))
    formData.append('apiKey', process.env.BEEIMG_API_KEY)
    const headers = formData.getHeaders()

    const response = await axios.post(
      'https://beeimg.com/api/upload/file/text/',
      formData,
      { headers }
    )

    fs.unlink(file.path, err => {
      if (err) {
        console.error('Error deleting file:', err.message)
      }
    })

    return response.data
  } catch (error) {
    console.error('Image upload error:', error.message)
    throw new Error('Image upload failed')
  }
}

export async function getBooks (req, res) {
  //   const { page = 1, limit = 10, title, author, wordCount, tags } = req.query
  const { page = 1, limit = 10, keyword, type, wordCount } = req.query

  try {
    const whereClause = buildWhereClause({ keyword, type, wordCount })

    const totalBooks = await prisma.book.count({ where: whereClause })
    const books = await prisma.book.findMany({
      where: whereClause,
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: { updatedAt: 'desc' }
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
        message: 'Book not found'
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
  const { title, author, description, wordCount, tags } = req.body

  if (!title || !author || !description) {
    return res.status(400).json({
      message: 'title, author, description, cannot be empty'
    })
  }

  if (!wordCount) {
    req.body.wordCount = 0
  }
  if (!tags) {
    req.body.tags = []
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

    console.log('book', book)
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
