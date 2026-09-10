-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F');

-- CreateTable
CREATE TABLE "Country" (
    "code" VARCHAR(3) NOT NULL,
    "picture" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "shortname" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "picture" TEXT NOT NULL,
    "countryCode" VARCHAR(3) NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "age" INTEGER NOT NULL,
    "last" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Player_rank_id_idx" ON "Player"("rank", "id");

-- CreateIndex
CREATE INDEX "Player_countryCode_idx" ON "Player"("countryCode");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
