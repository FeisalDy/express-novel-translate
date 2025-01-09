import prisma from '../utils/db.js'

export async function getBookIdForSiteMap (req, res) {
  const { id } = req.params

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid id parameter' })
  }

  const chunkId = Number(id)
  const start = (chunkId - 1) * 50000 + 1 // Start from 1 for id = 1
  const end = start + 50000 // End is exclusive

  try {
    const books = await prisma.book.findMany({
      where: {
        id: {
          gte: start,
          lt: end
        }
      },
      select: {
        id: true,
        updatedAt: true
      }
    })

    return res.json({
      message: 'Get Book ID Success',
      data: books
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}

export async function getChapterIdForSiteMap (req, res) {
  const { id } = req.params

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid id parameter' })
  }

  const chunkId = Number(id)
  const start = (chunkId - 1) * 50000 + 1 // Start from 1 for id = 1
  const end = start + 50000 // End is exclusive

  try {
    const chapters = await prisma.chapter.findMany({
      where: {
        id: {
          gte: start,
          lt: end
        }
      },
      select: {
        bookId: true,
        chapterNumber: true
      }
    })

    return res.json({
      message: 'Get Chapter ID Success',
      data: chapters
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}
