import { useState, useEffect } from "react";
import type { Movie, MatchResult } from "shared/dist";
// const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

function App() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [index, setIndex] = useState(0);
  const [matched, setMatched] = useState<MatchResult | null>(null);

  const API = "http://localhost:3000";

  useEffect(() => {
    if (submitted) {
      fetch(`${API}/movies`)
        .then((res) => res.json())
        .then(setMovies);
    }
  }, [submitted]);

  const likeMovie = async () => {
    const movie = movies[index];
    await fetch(`${API}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, movieId: movie.id }),
    });
    const res = await fetch(`${API}/match?email=${email}`);
    const match = await res.json();
    if (match.matched) setMatched(match);
    else setIndex((i) => i + 1);
  };

  if (!submitted) {
    return (
      <div className="p-4">
        <h2>Enter your email to start</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim().length >= 5 && email.includes("@")) {
              setSubmitted(true);
            } else {
              alert("Please enter a valid email.");
            }
          }}
        >
          <input
            type="email"
            className="border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <button type="submit" className="ml-2 p-2 bg-blue-500 text-white">
            Start
          </button>
        </form>
      </div>
    );
  }

  if (matched?.matched) {
    return (
      <div className="p-4">
        <h2>🎉 You matched on:</h2>
        <h3>{matched.movie?.title}</h3>
        <img
          src={`https://image.tmdb.org/t/p/w500${matched.movie?.poster_path}`}
          width="200"
        />
      </div>
    );
  }

  const current = movies[index];
  if (!current) return <div>No more movies!</div>;

  return (
    <div className="p-4">
      <h2>{current.title}</h2>
      <img
        src={`https://image.tmdb.org/t/p/w500${current.poster_path}`}
        width="200"
      />
      <p>{current.overview}</p>
      <button className="bg-green-500 text-white p-2 mt-2" onClick={likeMovie}>
        Like
      </button>
      <button
        className="bg-red-500 text-white p-2 ml-2"
        onClick={() => setIndex((i) => i + 1)}
      >
        Skip
      </button>
    </div>
  );
}

export default App;
