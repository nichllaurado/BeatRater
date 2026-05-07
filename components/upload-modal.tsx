"use client";
import {useState} from "react";

interface UploadModalProps {
    setShowModal: (show: boolean) => void;
}

export default function UploadModal({ setShowModal }: UploadModalProps) {
    const [beatName, setBeatName] = useState("");
    const [artistName, setArtistName] = useState("");

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
                <input type="file" accept="audio/*" className="mb-4" />
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Upload
                </button>
                <button className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={() => {
                    setBeatName("");
                    setArtistName("");
                    setShowModal(false);
                }}>
                    Cancel
                </button>
            </div>
        </div>
    );
}