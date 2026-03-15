import { stats } from '@/components/home/data';

export default function StatsSection() {
  return (
    <section id="stats" className="border-y border-border/50 bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold">
            Heart Disease by the Numbers
          </h2>
          <p className="text-muted-foreground">
            The scale of the global cardiovascular crisis
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`mb-1 text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="mb-1 font-semibold">{stat.label}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.sublabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
