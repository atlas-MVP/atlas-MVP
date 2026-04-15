"use client";

interface EventRow {
  id: number;
  title: string;
  event_type: string;
  event_date: string;
  article_url: string | null;
  media_type: string | null;
  media_url: string | null;
  media_thumbnail: string | null;
  metadata: Record<string, unknown>;
  latitude: number;
  longitude: number;
}

interface EventFeedProps {
  events: EventRow[];
  onClose: () => void;
  loading: boolean;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function typeBadgeColor(type: string): string {
  switch (type) {
    case "armed_conflict":
    case "mass_violence":
    case "assault":
      return "bg-red-600/80";
    case "protest":
      return "bg-yellow-600/80";
    case "threat":
    case "coercion":
      return "bg-orange-600/80";
    default:
      return "bg-zinc-600/80";
  }
}

export default function EventFeed({ events, onClose, loading }: EventFeedProps) {
  return (
    <div className="absolute top-0 left-0 h-full w-[380px] z-10 pointer-events-none">
      <div className="h-full m-3 pointer-events-auto rounded-lg overflow-hidden"
        style={{
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-white/90 text-sm font-medium tracking-wide">
            Nearby Events
          </span>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 text-lg leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-48px)] px-4 py-2">
          {loading && (
            <div className="text-white/40 text-sm text-center py-8">
              Searching...
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="text-white/40 text-sm text-center py-8">
              No events found within 50 miles.
            </div>
          )}

          {!loading &&
            events.map((event) => (
              <div
                key={`${event.id}-${event.media_type ?? "none"}`}
                className="py-3 border-b border-white/5 last:border-0"
              >
                {/* Type badge + date */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${typeBadgeColor(event.event_type)} text-white`}
                  >
                    {event.event_type.replace("_", " ")}
                  </span>
                  <span className="text-white/30 text-[11px]">
                    {formatDate(event.event_date)}
                  </span>
                </div>

                {/* Title */}
                <div className="text-white/85 text-sm leading-snug mb-1">
                  {event.title}
                </div>

                {/* Location from metadata */}
                {event.metadata &&
                  (event.metadata as Record<string, string>).location_name && (
                    <div className="text-white/30 text-xs mb-1.5">
                      {(event.metadata as Record<string, string>).location_name}
                    </div>
                  )}

                {/* Article link */}
                {event.article_url && (
                  <a
                    href={event.article_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400/80 hover:text-blue-300 text-xs"
                  >
                    Read article &rarr;
                  </a>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
