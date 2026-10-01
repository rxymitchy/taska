ALTER TABLE "Evaluation" ADD COLUMN "aiPrecheckFactuallyCorrect" BOOLEAN;
ALTER TABLE "Evaluation" ADD COLUMN "aiPrecheckLanguageNatural" BOOLEAN;
ALTER TABLE "Evaluation" ADD COLUMN "aiPrecheckUnderstandsContext" BOOLEAN;
ALTER TABLE "Evaluation" ADD COLUMN "aiPrecheckModel" TEXT;