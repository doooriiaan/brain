import { Activity } from "lucide-react";
import type { OperationsOverview } from "../../types";
import { EmptyCard } from "../EmptyCard";
import { FeedItem } from "../FeedItem";
import { MetricCard } from "../MetricCard";
import { SectionHeading } from "../SectionHeading";

type OperationsPulseProps = {
  cardToneClasses: Record<"info" | "success" | "warning", string>;
  formatLocalDate: (value: string) => string;
  operations: OperationsOverview;
  serviceToneClasses: Record<"online" | "ready" | "setup", string>;
  translate: (value: string) => string;
};

export function OperationsPulse({
  cardToneClasses,
  formatLocalDate,
  operations,
  serviceToneClasses,
  translate,
}: OperationsPulseProps) {
  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow={translate("Live pulse")}
        title={translate(
          "Notifications, services, uploads, leads, tickets, and activations in one place",
        )}
        copy={translate(
          "This layer gives the product the cloud-system feel: runtime metrics update, timeline items roll in, and service readiness is visible before the user even enters the admin or client portal.",
        )}
      />

      <div className="mt-7 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {operations.metrics.map((metric) => (
              <MetricCard key={metric.key} metric={metric} />
            ))}
          </div>

          <div className="glass-card compact-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-kicker">{translate("Timeline")}</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  {translate("Live runtime feed")}
                </h3>
              </div>
              <Activity className="h-5 w-5 text-[var(--accent)]" />
            </div>

            <div className="mt-5 space-y-3">
              {operations.timeline.length > 0 ? (
                operations.timeline.map((item) => (
                  <FeedItem
                    formatDate={formatLocalDate}
                    item={item}
                    key={item.id}
                    toneClassName={cardToneClasses[item.status]}
                  />
                ))
              ) : (
                <EmptyCard
                  message={translate(
                    "Runtime feed will appear here once the first live action lands.",
                  )}
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card compact-card">
            <p className="section-kicker">{translate("Service status")}</p>
            <div className="mt-5 space-y-3">
              {operations.services.map((service) => (
                <div className="feed-row" key={service.key}>
                  <div className={`status-pill ${serviceToneClasses[service.status]}`}>
                    {service.status}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {service.label}
                    </p>
                    <p className="mt-1 text-sm text-white/58">{service.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card compact-card">
            <p className="section-kicker">{translate("Live notifications")}</p>
            <div className="mt-5 space-y-3">
              {operations.notifications.length > 0 ? (
                operations.notifications.map((notification) => (
                  <div className="feed-row" key={notification.id}>
                    <div
                      className={`status-pill ${cardToneClasses[notification.level]}`}
                    >
                      {notification.level}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-white/58">
                        {notification.body}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyCard
                  message={translate("No notifications have been emitted yet.")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
