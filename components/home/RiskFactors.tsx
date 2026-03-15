import { riskFactors } from '@/components/home/data';

export default function RiskFactors() {
  return (
    <section
      id="risk-factors"
      className="border-y border-border/50 bg-muted/30 py-20"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold">Major Risk Factors</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Understanding your personal risk factors is the first step toward
            prevention. Our AI evaluates all of these in your assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {riskFactors.map((factor) => (
            <div
              key={factor.title}
              className="group rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-semibold">{factor.title}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${factor.severityColor}`}
                >
                  {factor.severity}
                </span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                {factor.description}
              </p>
              <div className="flex items-center justify-between border-t border-border/50 pt-4">
                <span className="text-xs text-muted-foreground">
                  US Adult Prevalence
                </span>
                <span className="text-lg font-bold">{factor.prevalence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
