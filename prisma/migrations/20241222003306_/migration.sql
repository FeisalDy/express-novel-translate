/*
  Warnings:

  - A unique constraint covering the columns `[bookId,chapterNumber]` on the table `Chapter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chapter_bookId_chapterNumber_key" ON "Chapter"("bookId", "chapterNumber");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_bookId_chapterNumber_fkey" FOREIGN KEY ("bookId", "chapterNumber") REFERENCES "Chapter"("bookId", "chapterNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
