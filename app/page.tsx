"use client";
import UploadModal from "@/components/upload-modal";
import {useState} from "react";

const handleClick = () => {
  const beatDisp = document.getElementById("beat-disp");
  if (beatDisp) {
    beatDisp.classList.remove("hidden");
  }
}


export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

  return (
    <div className="flex flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to BeatRater!</h1>
        <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleClick}>
          next beat
        </button>
      <div id="beat-disp" className="hidden">
        <p id="beat-info">Beat name</p>
        <audio controls>
          <source src=" https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <div className="flex text-4xl mt-4 cursor-pointer">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setSelectedRating(star)}
              className={
                star <= selectedRating
                  ? "text-yellow-400"
                  : "text-gray-400"
              }
            >
              ★
            </span>
          ))}
        </div>

        <p className="mt-2">Selected Rating: {selectedRating}</p>
      </div>
      <button className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => setShowModal(true)}>
        Upload Beat
      </button>
      {showModal && <UploadModal setShowModal={setShowModal} />}
    </div>
  );
}
