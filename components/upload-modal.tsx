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

        const fileName = `${Date.now()}-${file.name}`;
        const { data: { user } } = await supabase.auth.getUser();

        const { error: storageError } = await supabase.storage
            .from("beats-audio")
            .upload(fileName, file);

        if (storageError) {
            setError(`Storage error: ${storageError.message}`);
            setUploading(false);
            return;
        }

        const { data: urlData } = supabase.storage
            .from("beats-audio")
            .getPublicUrl(fileName);

        const { error: dbError } = await supabase
            .from("beats")
            .insert({ beat_name: beatName, artist_name: artistName, file_url: urlData.publicUrl, user_id: user?.id });

        if (dbError) {
            setError(`DB error: ${dbError.message}`);
            setUploading(false);
            return;
        }

        setUploading(false);
        onUploadSuccess();
        setShowModal(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Upload Your Beat</h2>
                <input
                    type="text"
                    placeholder="Beat Name"
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                    value={beatName}
                    onChange={(e) => setBeatName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Artist Name"
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                />
                <input
                    type="file"
                    accept="audio/*"
                    className="mb-4"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? "Uploading..." : "Upload"}
                </button>
                <button
                    className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={() => {
                        setBeatName("");
                        setArtistName("");
                        setFile(null);
                        setShowModal(false);
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}