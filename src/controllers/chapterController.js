import prisma from '../utils/db.js'

function mapChapterData (body) {
  const data = {}

  if (body.bookId) data.bookId = body.bookId
  if (body.chapterNumber) data.chapterNumber = body.chapterNumber
  if (body.chapterTitle) data.chapterTitle = body.chapterTitle
  if (body.content) data.content = body.content

  return data
}

export async function getChapterById (req, res) {
  const { id } = req.params

  if (isNaN(id)) {
    return res.status(400).json({
      message: 'Invalid chapter ID',
      chapter: {}
    })
  }

  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: Number(id) }
    })

    return res.json({
      message: 'Data Retrieved',
      data: chapter || {}
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}

export async function createChapter (req, res) {
  const { bookId, chapterNumber, chapterTitle, content } = req.body

  if (!bookId || !chapterNumber || !chapterTitle || !content) {
    return res.status(400).json({
      message: 'bookId, chapterNumber, chapterTitle, and content are required'
    })
  }

  if (isNaN(bookId)) {
    return res.status(400).json({
      message: 'Invalid book ID'
    })
  }

  try {
    const chapterData = mapChapterData(req.body)
    const chapter = await prisma.chapter.create({ data: chapterData })

    return res.status(201).json({
      message: 'Create Chapter Success',
      data: chapter
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}

export async function updateChapterById (req, res) {
  const { id } = req.params

  if (isNaN(id)) {
    return res.status(400).json({
      message: 'Invalid chapter ID'
    })
  }

  try {
    const updateData = mapChapterData(req.body)

    const chapter = await prisma.chapter.update({
      where: { id: Number(id) },
      data: updateData
    })

    return res.json({
      message: 'Update Chapter Success',
      data: chapter
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}

export async function deleteChapterById (req, res) {
  const { id } = req.params

  if (isNaN(id)) {
    return res.status(400).json({
      message: 'Invalid chapter ID'
    })
  }

  try {
    await prisma.chapter.delete({
      where: { id: Number(id) }
    })

    return res.json({
      message: 'Delete Chapter Success'
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}
