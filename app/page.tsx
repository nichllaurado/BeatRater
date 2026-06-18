"use client";
import UploadModal from "@/components/upload-modal";
import AuthModal from "@/components/auth-modal";
import TopTen from "@/components/top-ten";
import { useState, useEffect } from "react";
import { supabase, type Beat } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

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

  useEffect(() => { fetchBeats(); }, []);

  const currentBeat = currentIndex !== null ? beats[currentIndex] : null;

  useEffect(() => {
    if (!currentBeat) return;
    setSelectedRating(0);
    setSavedRating(0);
    setAvgRating(null);
    setRatingCount(0);

    const loadRatings = async () => {
      const { data: allRatings } = await supabase
        .from("ratings").select("rating").eq("beat_id", currentBeat.id);
      if (allRatings && allRatings.length > 0) {
        const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
        setAvgRating(Math.round(avg * 10) / 10);
        setRatingCount(allRatings.length);
      }
      if (user) {
        const { data: userRating } = await supabase
          .from("ratings").select("rating")
          .eq("beat_id", currentBeat.id).eq("user_id", user.id).maybeSingle();
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
    const { error } = await supabase.from("ratings").upsert(
      { user_id: user.id, beat_id: currentBeat.id, rating: star },
      { onConflict: "user_id,beat_id" }
    );
    if (!error) {
      setSavedRating(star);
      const { data: allRatings } = await supabase
        .from("ratings").select("rating").eq("beat_id", currentBeat.id);
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
    setCurrentIndex((prev) => prev === null ? 0 : (prev + 1) % beats.length);
  };

  const handlePlayFromList = (beatId: string) => {
    const idx = beats.findIndex((b) => b.id === beatId);
    if (idx !== -1) {
      setCurrentIndex(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center px-6 py-12">

      {/* Navbar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Beat<span className="text-purple-400">Rater</span>
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">by NickBeatz</p>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-1.5 text-sm bg-purple-500 text-black font-medium rounded-lg hover:bg-purple-400 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Player card */}
      <div className="w-full max-w-2xl bg-[#161616] border border-white/5 rounded-2xl p-8 flex flex-col items-center gap-5 shadow-xl">
        {currentBeat ? (
          <>
            <div className="text-center">
              <p className="text-xl font-semibold">{currentBeat.beat_name}</p>
              <p className="text-gray-500 text-sm mt-1">{currentBeat.artist_name}</p>
            </div>
            <audio controls key={currentBeat.id} className="w-full">
              <source src={currentBeat.file_url} type="audio/mpeg" />
            </audio>

            {/* Avg rating — shown after user rates */}
            {savedRating > 0 && (
              <div className="flex flex-col items-center gap-1 border-t border-white/5 pt-4 w-full">
                <div className="flex text-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={avgRating !== null && star <= Math.round(avgRating) ? "text-purple-400" : "text-white/10"}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {avgRating !== null
                    ? <><span className="text-gray-300 font-medium">{avgRating}/5</span> · {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}</>
                    : "No ratings yet"}
                </p>
              </div>
            )}

            {/* User rating */}
            {user ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex text-4xl gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => !savingRating && handleRating(star)}
                      className={`cursor-pointer transition-colors ${
                        star <= selectedRating ? "text-purple-400" : "text-white/15 hover:text-purple-300"
                      } ${savingRating ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  {savedRating > 0 ? `Your rating: ${savedRating}/5` : "Click to rate"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                <button onClick={() => setShowAuthModal(true)} className="text-purple-400 hover:underline">
                  Sign in
                </button>{" "}to leave a rating
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-600 text-sm py-8">Hit &quot;Next Beat&quot; to start listening</p>
        )}

        {/* Controls */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleNextBeat}
            disabled={beats.length === 0}
            className="px-5 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            {beats.length === 0 ? "No beats yet" : "Next Beat"}
          </button>
          <button
            onClick={() => user ? setShowModal(true) : setShowAuthModal(true)}
            className="px-5 py-2 bg-purple-500 text-black font-medium rounded-lg text-sm hover:bg-purple-400 transition-colors"
          >
            Upload Beat
          </button>
        </div>
      </div>

      {/* Top 10 */}
      <div className="w-full max-w-2xl mt-12">
        <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-widest mb-4">Top 10</h2>
        <TopTen onPlay={handlePlayFromList} activeBeatId={currentBeat?.id} />
      </div>

      {showModal && <UploadModal setShowModal={setShowModal} onUploadSuccess={fetchBeats} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
