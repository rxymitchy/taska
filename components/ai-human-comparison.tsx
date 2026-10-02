import { checkLabels, yesNo } from "@/lib/evaluation-copy";

type Scores = {
  factuallyCorrect: boolean | null;
  languageNatural: boolean | null;
  understandsContext: boolean | null;
};

export function AiHumanComparison({
  ai,
  human,
}: {
  ai: Scores & { model: string | null };
  human: Scores;
}) {
  const rows = [
    [checkLabels.factuallyCorrect, ai.factuallyCorrect, human.factuallyCorrect],
    [checkLabels.languageNatural, ai.languageNatural, human.languageNatural],
    [
      checkLabels.understandsContext,
      ai.understandsContext,
      human.understandsContext,
    ],
  ] as const;

  return (
    <section className="content-surface mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl tracking-tight">AI and human check</h2>

        <p className="text-sm text-muted">
          {ai.model ? `AI pre-check: ${ai.model}` : "AI pre-check unavailable"}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-bold uppercase text-muted">
              <th className="py-2 pr-4 font-medium">Question</th>
              <th className="px-3 py-2 font-medium">AI</th>
              <th className="px-3 py-2 font-medium">Human</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(([label, aiScore, humanScore]) => (
              <tr key={label} className="border-b border-line last:border-0">
                <th className="py-2 pr-4 font-normal">{label}</th>
                <td className="px-3 py-2">{yesNo(aiScore)}</td>
                <td className="px-3 py-2">{yesNo(humanScore)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
