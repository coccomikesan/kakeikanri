-- CreateTable
CREATE TABLE "MonthlyNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yearMonth" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyNote_yearMonth_key" ON "MonthlyNote"("yearMonth");
