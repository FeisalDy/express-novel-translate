import e from 'cors'
import prisma from './db.js'
import { randomInt } from 'crypto'

// Helper function to generate placeholder content
function generateContent (wordCount) {
  const placeholder = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  const words = []
  while (words.length < wordCount) {
    words.push(placeholder)
  }
  return words.join(' ')
}

async function main () {
  // Create users
  //   for (const user of [
  //     {
  //       OAuthProvider: 'provider1',
  //       OAuthUserID: 'user1',
  //       email: 'user1@example.com',
  //       username: 'User 1',
  //       avatar: 'avatar1.png',
  //       role: 'USER'
  //     },
  //     {
  //       OAuthProvider: 'provider2',
  //       OAuthUserID: 'user2',
  //       email: 'user2@example.com',
  //       username: 'User 2',
  //       avatar: 'avatar2.png',
  //       role: 'USER'
  //     }
  //   ]) {
  //     await prisma.user.upsert({
  //       where: { OAuthUserID: user.OAuthUserID },
  //       update: {},
  //       create: user
  //     })
  //   }

  //   // Create books
  //   const books = [
  //     {
  //       title: 'Book Title 1',
  //       cn_title: '书名1',
  //       author: 'Author 1',
  //       cn_author: '作者1',
  //       wordCount: 50000,
  //       tags: ['fiction', 'adventure']
  //     },
  //     {
  //       title: 'Book Title 2',
  //       cn_title: '书名2',
  //       author: 'Author 2',
  //       cn_author: '作者2',
  //       wordCount: 75000,
  //       tags: ['non-fiction', 'biography']
  //     }
  //   ]

  //   for (const book of books) {
  //     const existingBook = await prisma.book.findFirst({
  //       where: {
  //         title: book.title,
  //         author: book.author
  //       }
  //     })

  //     if (!existingBook) {
  //       await prisma.book.create({ data: book })
  //     }
  //   }

  //   // Fetch created books
  const allBooks = await prisma.book.findMany()

  //   // Create chapters
  //   for (const book of allBooks) {
  //     const existingChapters = await prisma.chapter.findMany({
  //       where: { bookId: book.id }
  //     })

  //     if (existingChapters.length === 0) {
  //       const chapters = Array.from({ length: 10 }, (_, i) => ({
  //         chapterTitle: `Chapter ${i + 1} of ${book.title}`,
  //         chapterNumber: i + 1,
  //         content: generateContent(1000),
  //         bookId: book.id
  //       }))

  //       await prisma.chapter.createMany({ data: chapters })
  //     }
  //   }

  // Create comments
  for (const book of allBooks) {
    for (let i = 1; i <= 5; i++) {
      const existingComment = await prisma.comment.findFirst({
        where: {
          bookId: book.id,
          userId: randomInt(4, 8),
          chapterNumber: i <= 10 ? i : null
        }
      })
      console.log(existingComment)

      //   console.log({
      //     data: {
      //       content: `This is a comment ${i} for ${book.title}.`,
      //       bookId: book.id,
      //       userId: (i % 2) + 1,
      //       chapterNumber: i <= 10 ? i : null,
      //       commentType: 'BOOK'
      //     }
      //   })

      if (!existingComment) {
        await prisma.comment.create({
          data: {
            content: `This is a comment ${i} for ${book.title}.`,
            bookId: book.id,
            userId: randomInt(4, 8),
            chapterNumber: i <= 10 ? i : null,
            commentType: 'BOOK'
          }
        })
      }
    }
  }

  console.log('Seed data created successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
