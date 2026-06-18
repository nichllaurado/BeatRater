"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface UploadModalProps {
  setShowModal: (show: boolean) => void;
  onUploadSuccess: () => void;
}

export default function UploadModal({ setShowModal, onUploadSuccess }: UploadModalProps) {
  const [beatName, setBeatName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!beatName || !artistName || !file) {
      setError("Please fill in all fields and select a file.");
      return;
    }
    setUploading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();

    const fileName = `${Date.now()}-${file.name}`;
    const { error: storageError } = await supabase.storage
      .from("beats-audio").upload(fileName, file);

    if (storageError) {
      setError(`Storage error: ${storageError.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("beats-audio").getPublicUrl(fileName);

    const { error: dbError } = await supabase.from("beats").insert({
      beat_name: beatName,
      artist_name: artistName,
      file_url: urlData.publicUrl,
      user_id: user?.id,
    });

    if (dbError) {
      setError(`DB error: ${dbError.message}`);
      setUploading(false);
      return;
    }

    setUploading(false);
    onUploadSuccess();
    setShowModal(false);
  };

  const inputClass = "w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 text-white";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
      <div className="relative bg-[#161616] border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-400 transition-colors"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-6">Upload a Beat</h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Beat name"
            className={inputClass}
            value={beatName}
            onChange={(e) => setBeatName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Artist name"
            className={inputClass}
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
          />
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-600">Audio file</span>
            <input
              type="file"
              accept="audio/*"
              className="text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-gray-300 hover:file:bg-white/20 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 py-2.5 bg-purple-500 text-black font-medium rounded-lg text-sm hover:bg-purple-400 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
