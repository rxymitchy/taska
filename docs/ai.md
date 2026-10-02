# AI Setup and Evaluation

Taska uses the OpenAI-compatible Chat Completions API for answer generation and an optional AI pre-check. Both calls run on the server. The human evaluator and reviewer remain responsible for the final result.

## Pre-check rubric

For each answer, the model receives the question, answer, language, and local context. It returns booleans for:

| Field                | Human-facing question                                             |
| -------------------- | ----------------------------------------------------------------- |
| `factuallyCorrect`   | Is this true enough to follow, including the facts in the answer? |
| `languageNatural`    | Would someone from here actually say it this way?                 |
| `understandsContext` | Does it know how things work here?                                |

The model name and nullable scores are stored on `Evaluation`. A missing score means no valid AI pre-check was available; it must not be treated as a human answer or as approval. Company results and reviewer decisions display the AI scores beside the human scores. Evaluators do not see the pre-check before submitting, to avoid influencing their independent judgment.

## Model quality

The default `gpt-4o-mini` is a starting point, not a claim of quality for every African language. Before relying on a language, build a representative set of local prompts and answers, have fluent local speakers score accuracy, naturalness, and context, and compare candidate models on that same set. Start with Swahili and record the benchmark date, examples, model/version, and reviewer findings here. Do not enable automated decisions or payments based on AI scores.

Treat submitted prompts and answers as potentially sensitive. Send only the evaluation content needed for generation or scoring, and review the provider's data handling and retention terms before production use.
