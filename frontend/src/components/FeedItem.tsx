import type { RuntimeEvent } from "../types";

type FeedItemProps = {
  item: RuntimeEvent;
  toneClassName: string;
  formatDate: (value: string) => string;
};

export function FeedItem({ item, toneClassName, formatDate }: FeedItemProps) {
  return (
    <div className="feed-row">
      <div className={`status-pill ${toneClassName}`}>{item.type}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
        <p className="mt-1 text-sm text-white/58">{item.detail}</p>
      </div>
      <div className="text-xs text-white/42">{formatDate(item.createdAt)}</div>
    </div>
  );
}
