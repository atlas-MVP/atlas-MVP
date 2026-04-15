"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import EventFeed from "./EventFeed";

const MvpMap = dynamic(() => import("./MvpMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />,
});

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

export default function MvpPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setFeedOpen(true);

    try {
      const res = await fetch(
        `/api/events?lat=${lat}&lng=${lng}&radius=50`
      );
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black">
      <MvpMap
        onMapClick={handleMapClick}
        eventMarkers={events}
      />

      {feedOpen && (
        <EventFeed
          events={events}
          loading={loading}
          onClose={() => setFeedOpen(false)}
        />
      )}
    </div>
  );
}
