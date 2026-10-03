-- Reverse extra DEPOSIT rows from the same invoice being credited twice.
WITH ranked AS (
  SELECT
    id,
    "companyId",
    "amountSats",
    ROW_NUMBER() OVER (PARTITION BY "depositId" ORDER BY "createdAt" ASC, id ASC) AS rn
  FROM "CreditLedger"
  WHERE kind = 'DEPOSIT' AND "depositId" IS NOT NULL
),
removed AS (
  DELETE FROM "CreditLedger"
  WHERE id IN (SELECT id FROM ranked WHERE rn > 1)
  RETURNING "companyId", "amountSats"
),
totals AS (
  SELECT "companyId", SUM("amountSats")::int AS extra
  FROM removed
  GROUP BY "companyId"
)
UPDATE "EmployerProfile" AS e
SET "prepaidSats" = GREATEST(0, e."prepaidSats" - t.extra)
FROM totals AS t
WHERE e.id = t."companyId";

CREATE UNIQUE INDEX "CreditLedger_depositId_key" ON "CreditLedger"("depositId");
