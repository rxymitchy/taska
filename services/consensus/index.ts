/**
 * Teammate C owns this function.
 *
 * Input: how many evaluator submissions exist for one evaluation.
 * Processing: decide whether the answers agree enough to enter review.
 * Output: true when the reviewer queue should open.
 * Connects at submitHumanEvaluation(), after the latest answers are saved.
 * While this returns true for a single submission, the one-evaluator flow keeps working.
 */
export function shouldEnterReview(submissionCount: number) {
  return submissionCount >= 1
}
