"use client";
import UploadModal from "@/components/upload-modal";
import { useState, useEffect } from "react";
import { supabase, type Beat } from "@/lib/supabase";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const fetchBeats = async () => {
    const { data } = await supabase.from("beats").select("*").order("created_at", { ascending: false });
    if (data) setBeats(data);
  };

  useEffect(() => {
    fetchBeats();
  }, []);

  const handleNextBeat = () => {
    if (beats.length === 0) return;
    setSelectedRating(0);
    setCurrentIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % beats.length;
    });
  };

  const currentBeat = currentIndex !== null ? beats[currentIndex] : null;

  return (
    <div className="flex flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to BeatRater!</h1>
      <button
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        onClick={handleNextBeat}
        disabled={beats.length === 0}
      >
        {beats.length === 0 ? "No beats yet" : "Next Beat"}
      </button>
      {currentBeat && (
        <div className="mt-6 flex flex-col items-center">
          <p className="text-xl font-semibold">{currentBeat.beat_name}</p>
          <p className="text-gray-500 mb-2">{currentBeat.artist_name}</p>
          <audio controls key={currentBeat.id}>
            <source src={currentBeat.file_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <div className="flex text-4xl mt-4 cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setSelectedRating(star)}
                className={star <= selectedRating ? "text-yellow-400" : "text-gray-400"}
              >
                ★
              </span>
            ))}
          </div>
          <p className="mt-2">Selected Rating: {selectedRating}</p>
        </div>
      )}
      <button
        className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => setShowModal(true)}
      >
        Upload Beat
      </button>
      {showModal && (
        <UploadModal
          setShowModal={setShowModal}
          onUploadSuccess={fetchBeats}
        />
      )}
    </div>
  );
}
