DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuizSetStatus') THEN
    CREATE TYPE "QuizSetStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuestionType') THEN
    CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuizAttemptStatus') THEN
    CREATE TYPE "QuizAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED');
  END IF;
END $$;

ALTER TABLE "users"
  ALTER COLUMN "zaloId" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "email" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "passwordHash" TEXT,
  ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'USER';

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

CREATE TABLE IF NOT EXISTS "quiz_topics" (
  "id" TEXT NOT NULL,
  "slug" VARCHAR(120) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "archivedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quiz_topics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "quiz_topics_slug_key" ON "quiz_topics"("slug");
CREATE INDEX IF NOT EXISTS "quiz_topics_isActive_archivedAt_order_idx" ON "quiz_topics"("isActive", "archivedAt", "order");

CREATE TABLE IF NOT EXISTS "quiz_sets" (
  "id" TEXT NOT NULL,
  "topicId" TEXT NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "timeLimit" INTEGER NOT NULL,
  "status" "QuizSetStatus" NOT NULL DEFAULT 'DRAFT',
  "version" INTEGER NOT NULL DEFAULT 1,
  "order" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMPTZ(6),
  "closedAt" TIMESTAMPTZ(6),
  "archivedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quiz_sets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "quiz_sets_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "quiz_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "quiz_sets_topicId_status_archivedAt_order_idx" ON "quiz_sets"("topicId", "status", "archivedAt", "order");

CREATE TABLE IF NOT EXISTS "quiz_questions" (
  "id" TEXT NOT NULL,
  "quizSetId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
  "points" INTEGER NOT NULL DEFAULT 10,
  "order" INTEGER NOT NULL DEFAULT 0,
  "explanation" TEXT,
  "archivedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "quiz_questions_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "quiz_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "quiz_questions_quizSetId_archivedAt_order_idx" ON "quiz_questions"("quizSetId", "archivedAt", "order");

CREATE TABLE IF NOT EXISTS "quiz_options" (
  "id" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isCorrect" BOOLEAN NOT NULL DEFAULT false,
  "archivedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quiz_options_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "quiz_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "quiz_options_questionId_archivedAt_order_idx" ON "quiz_options"("questionId", "archivedAt", "order");

CREATE TABLE IF NOT EXISTS "quiz_attempts" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "quizSetId" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "maxScore" INTEGER NOT NULL DEFAULT 0,
  "timeTaken" INTEGER NOT NULL DEFAULT 0,
  "status" "QuizAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "submittedAt" TIMESTAMPTZ(6),
  CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "quiz_attempts_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "quiz_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "quiz_attempts_userId_quizSetId_key" ON "quiz_attempts"("userId", "quizSetId");
CREATE INDEX IF NOT EXISTS "quiz_attempts_quizSetId_score_timeTaken_submittedAt_idx" ON "quiz_attempts"("quizSetId", "score" DESC, "timeTaken", "submittedAt");

CREATE TABLE IF NOT EXISTS "quiz_attempt_answers" (
  "id" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "selectedOptionId" TEXT,
  "isCorrect" BOOLEAN NOT NULL DEFAULT false,
  "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
  "questionContent" TEXT NOT NULL,
  "selectedOptionContent" TEXT,
  "correctOptionContent" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quiz_attempt_answers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "quiz_attempt_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "quiz_attempt_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "quiz_attempt_answers_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "quiz_options"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "quiz_attempt_answers_attemptId_idx" ON "quiz_attempt_answers"("attemptId");
CREATE INDEX IF NOT EXISTS "quiz_attempt_answers_questionId_idx" ON "quiz_attempt_answers"("questionId");
