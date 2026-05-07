"use client";

const handleClick = () => {
  console.log("button pressed");
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to BeatRater!</h1>
      <div id="beat-disp">
        <audio controls>
          <source src=" https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <div id="star-rating" className="rating">
          <span className="star" data-value="1">★</span>
          <span className="star" data-value="2">★</span>
          <span className="star" data-value="3">★</span>
          <span className="star" data-value="4">★</span>
          <span className="star" data-value="5">★</span>
        </div>
        <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleClick}>
          new
        </button>
      </div>
    </div>
  );
}
