"use client";
import UploadModal from "@/components/upload-modal";
import AuthModal from "@/components/auth-modal";
import { useState, useEffect } from "react";
import { supabase, type Beat } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Rating state
  const [selectedRating, setSelectedRating] = useState(0);
  const [savedRating, setSavedRating] = useState(0);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [savingRating, setSavingRating] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchBeats = async () => {
    const { data } = await supabase.from("beats").select("*").order("created_at", { ascending: false });
    if (data) setBeats(data);
  };

  useEffect(() => {
    fetchBeats();
  }, []);

  const currentBeat = currentIndex !== null ? beats[currentIndex] : null;

  // Load ratings when beat or user changes
  useEffect(() => {
    if (!currentBeat) return;

    setSelectedRating(0);
    setSavedRating(0);
    setAvgRating(null);
    setRatingCount(0);

    const loadRatings = async () => {
      // Average rating for this beat (public)
      const { data: allRatings } = await supabase
        .from("ratings")
        .select("rating")
        .eq("beat_id", currentBeat.id);

      if (allRatings && allRatings.length > 0) {
        const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
        setAvgRating(Math.round(avg * 10) / 10);
        setRatingCount(allRatings.length);
      }

      // User's own rating
      if (user) {
        const { data: userRating } = await supabase
          .from("ratings")
          .select("rating")
          .eq("beat_id", currentBeat.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (userRating) {
          setSavedRating(userRating.rating);
          setSelectedRating(userRating.rating);
        }
      }
    };

    loadRatings();
  }, [currentBeat?.id, user?.id]);

  const handleRating = async (star: number) => {
    if (!user || !currentBeat) return;
    setSelectedRating(star);
    setSavingRating(true);

    const { error } = await supabase
      .from("ratings")
      .upsert(
        { user_id: user.id, beat_id: currentBeat.id, rating: star },
        { onConflict: "user_id,beat_id" }
      );

    if (!error) {
      setSavedRating(star);
      // Refresh avg
      const { data: allRatings } = await supabase
        .from("ratings")
        .select("rating")
        .eq("beat_id", currentBeat.id);
      if (allRatings && allRatings.length > 0) {
        const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
        setAvgRating(Math.round(avg * 10) / 10);
        setRatingCount(allRatings.length);
      }
    }
    setSavingRating(false);
  };

  const handleNextBeat = () => {
    if (beats.length === 0) return;
    setCurrentIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % beats.length;
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col items-center justify-between p-24">
      {/* Auth bar */}
      <div className="absolute top-4 right-6 flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        )}
      </div>

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

          {/* Average rating — shown only after the user has rated */}
          {savedRating > 0 && (
            <div className="mt-4 flex flex-col items-center gap-1">
              <div className="flex text-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={avgRating !== null && star <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-200"}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {avgRating !== null
                  ? <><span className="font-semibold text-gray-700">{avgRating}/5</span> · {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}</>
                  : "No ratings yet"}
              </p>
            </div>
          )}

          {user ? (
            <div className="flex flex-col items-center mt-3">
              <div className="flex text-4xl cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => !savingRating && handleRating(star)}
                    className={`transition-colors ${
                      star <= selectedRating ? "text-yellow-400" : "text-gray-300"
                    } ${savingRating ? "opacity-50 cursor-not-allowed" : "hover:text-yellow-300"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {savedRating > 0 ? `Your rating: ${savedRating}/5` : "Click to rate"}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              <button onClick={() => setShowAuthModal(true)} className="text-blue-600 hover:underline">
                Sign in
              </button>{" "}
              to leave a rating
            </p>
          )}
        </div>
      )}

      {user ? (
        <button
          className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setShowModal(true)}
        >
          Upload Beat
        </button>
      ) : (
        <button
          className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setShowAuthModal(true)}
        >
          Upload Beat
        </button>
      )}

      {showModal && (
        <UploadModal setShowModal={setShowModal} onUploadSuccess={fetchBeats} />
      )}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
