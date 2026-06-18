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

  if (loading) return <p className="text-sm text-gray-600">Loading rankings...</p>;
  if (beats.length === 0) return <p className="text-sm text-gray-600">No rated beats yet.</p>;

  return (
    <ol className="space-y-2">
      {beats.map((beat, i) => {
        const isActive = beat.id === activeBeatId;
        return (
          <li
            key={beat.id}
            onClick={() => onPlay(beat.id)}
            className={`flex items-center gap-4 rounded-xl px-4 py-3 cursor-pointer transition-colors border ${
              isActive
                ? "bg-purple-500/10 border-purple-500/30"
                : "bg-[#161616] border-white/5 hover:bg-white/5"
            }`}
          >
            <span className="text-base font-bold text-gray-700 w-5 text-right shrink-0">
              {i + 1}
            </span>
            <span className={`text-sm shrink-0 ${isActive ? "text-purple-400" : "text-gray-600"}`}>
              {isActive ? "▶" : "▷"}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${isActive ? "text-purple-300" : "text-gray-200"}`}>
                {beat.beat_name}
              </p>
              <p className="text-xs text-gray-600 truncate">{beat.artist_name}</p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div className="flex text-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(beat.avg_rating) ? "text-purple-400" : "text-white/10"}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-600">
                {beat.avg_rating}/5 · {beat.rating_count} {beat.rating_count === 1 ? "rating" : "ratings"}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
