import prisma from '../utils/db'

export async function getComments (req, res) {
  try {
    const comments = await prisma.comment.findMany()

    return res.json({
      message: 'Data Retrieved',
      data: comments
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ message: 'An error occurred' })
  }
}
