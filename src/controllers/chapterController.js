import prisma from '../utils/db.js'
import fs from 'fs'
import path from 'path'

/**
 * Maps request body to chapter data object.
 * @param {Object} body - Request body.
 * @returns {Object} - Mapped chapter data object.
 */
function mapChapterData (body) {
  return {
    ...(body.bookId && { bookId: body.bookId }),
    ...(body.chapterNumber && { chapterNumber: body.chapterNumber }),
    ...(body.chapterTitle && { chapterTitle: body.chapterTitle }),
    ...(body.content && { content: body.content })
  }
}

/**
 * Reads and parses the content of the file into chapters.
 * @param {string} filePath - Path to the uploaded file.
 * @param {number} bookId - Book ID to associate with each chapter.
 * @param {string} regex - Regular expression pattern to match chapter titles.
 * @returns {Promise<Array>} - Array of chapter objects with title and content.
 */
async function parseChaptersFromFile (filePath, bookId, regex) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const chapters = []
  let currentTitle = null
  let currentContent = []

  //   const chapterRegex = /第[一二三四五六七八九十百千零\d]+章/
  //   const chapterRegex = regex
  const chapterRegex =
    typeof regex === 'string'
      ? new RegExp(regex.replace(/^\/|\/$/g, '')) // Remove leading and trailing slashes
      : regex

  console.log(chapterRegex)
  lines.forEach(line => {
    line = line.replace(/\0/g, '')

    if (chapterRegex.test(line.trim())) {
      if (currentTitle) {
        chapters.push({
          bookId: parseInt(bookId, 10),
          chapterNumber: chapters.length + 1,
          chapterTitle: currentTitle,
          content: currentContent.join('\n')
        })
      }
      currentTitle = line.trim()
      currentContent = []
    } else {
      currentContent.push(line.trim())
    }
  })

  if (currentTitle) {
    chapters.push({
      bookId: parseInt(bookId, 10),
      chapterNumber: chapters.length + 1,
      chapterTitle: currentTitle,
      content: currentContent.join('\n')
    })
  }

  return chapters
}

/**
 * Deletes the uploaded file.
 * @param {string} filePath - Path to the file to be deleted.
 */
function deleteFile (filePath) {
  try {
    fs.unlinkSync(filePath)
    console.log(`File ${filePath} deleted successfully.`)
  } catch (error) {
    console.error(`Failed to delete file: ${filePath}. Error: ${error.message}`)
  }
}

export async function getChapterByIdOrBookIdAndChapterNumber (req, res) {
  const { id } = req.params
  const { bookId, chapterNumber } = req.query

  if ((!bookId || !chapterNumber) && !id) {
    return res.status(400).json({
      message:
        'Invalid parameters. Provide either both bookId and chapterNumber or chapter ID.'
    })
  }

  try {
    let chapter

    if (bookId && chapterNumber) {
      chapter = await prisma.chapter.findFirst({
        where: {
          bookId: Number(bookId),
          chapterNumber: Number(chapterNumber)
        },
        include: {
          comments: {
            select: { id: true, content: true }
          }
        }
      })
    } else if (id) {
      if (isNaN(id)) {
        return res.status(400).json({
          message: 'Invalid chapter ID'
        })
      }

      chapter = await prisma.chapter.findUnique({
        where: { id: Number(id) },
        include: {
          comments: {
            select: { id: true, content: true }
          }
        }
      })
    }

    if (!chapter) {
      return res.status(404).json({
        message: 'Chapter not found'
      })
    }

    return res.json({
      message: 'Data Retrieved',
      data: chapter
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}

export async function createChapter (req, res) {
  const { bookId, chapterNumber, chapterTitle, content, regex } = req.body
  const file = req.file

  if (file && content) {
    return res.status(400).json({
      message: 'Please provide either a file or content, not both.'
    })
  }

  if (isNaN(bookId)) {
    return res.status(400).json({
      message: 'Invalid book ID'
    })
  }

  if (!regex) {
    return res.status(400).json({
      message: 'Please provide a regex pattern to parse chapters from the file.'
    })
  }

  try {
    if (file) {
      const filePath = path.resolve(file.path)
      const chapters = await parseChaptersFromFile(filePath, bookId, regex)

      const createdChapters = await prisma.chapter.createMany({
        data: chapters
      })

      deleteFile(filePath)

      return res.status(201).json({
        message: `${createdChapters.count} chapters created successfully`
      })
    }

    if (!chapterNumber || !chapterTitle || !content) {
      return res.status(400).json({
        message: 'bookId, chapterNumber, chapterTitle, and content are required'
      })
    }

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

export async function deleteChaptersByBookId (req, res) {
  const { bookId } = req.params

  if (isNaN(bookId)) {
    return res.status(400).json({
      message: 'Invalid book ID'
    })
  }

  try {
    await prisma.chapter.deleteMany({
      where: { bookId: Number(bookId) }
    })

    return res.json({
      message: 'Delete Chapters Success'
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}
