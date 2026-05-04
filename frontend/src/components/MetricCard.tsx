import type { RuntimeMetric } from "../types";

type MetricCardProps = {
  metric: RuntimeMetric;
};

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <div className="data-card compact-card">
      <p className="text-xs uppercase tracking-[0.28em] text-white/45">
        {metric.label}
      </p>
      <p className="mt-4 text-2xl font-semibold text-white">{metric.value}</p>
      <p className="mt-3 text-sm leading-6 text-white/62">{metric.detail}</p>
    </div>
  );
}
