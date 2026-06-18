"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RankedBeat = {
  id: string;
  beat_name: string;
  artist_name: string;
  avg_rating: number;
  rating_count: number;
};

interface TopTenProps {
  onPlay: (beatId: string) => void;
  activeBeatId?: string;
}

export default function TopTen({ onPlay, activeBeatId }: TopTenProps) {
  const [beats, setBeats] = useState<RankedBeat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("beat_rankings")
      .select("id, beat_name, artist_name, avg_rating, rating_count")
      .limit(10)
      .then(({ data }) => {
        if (data) setBeats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-sm text-gray-400">Loading rankings...</p>;
  if (beats.length === 0) return <p className="text-sm text-gray-400">No rated beats yet.</p>;

  return (
    <ol className="w-full max-w-md space-y-2">
      {beats.map((beat, i) => {
        const isActive = beat.id === activeBeatId;
        return (
          <li
            key={beat.id}
            onClick={() => onPlay(beat.id)}
            className={`flex items-center gap-4 rounded-lg px-4 py-3 shadow-sm cursor-pointer transition-colors ${
              isActive
                ? "bg-blue-50 border border-blue-200"
                : "bg-white border border-gray-100 hover:bg-gray-50"
            }`}
          >
            <span className="text-xl font-bold text-gray-300 w-6 text-right shrink-0">
              {i + 1}
            </span>
            {/* Play/playing indicator */}
            <span className="text-lg shrink-0">
              {isActive ? "▶" : "▷"}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate ${isActive ? "text-blue-700" : "text-gray-900"}`}>
                {beat.beat_name}
              </p>
              <p className="text-sm text-gray-500 truncate">{beat.artist_name}</p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div className="flex text-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(beat.avg_rating) ? "text-yellow-400" : "text-gray-200"}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-400">
                {beat.avg_rating}/5 · {beat.rating_count} {beat.rating_count === 1 ? "rating" : "ratings"}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
