-- AlterTable
ALTER TABLE "Book" ALTER COLUMN "wordCount" SET DEFAULT 0,
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];
