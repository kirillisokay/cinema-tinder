import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared/dist";
import type { Movie, Like, MatchResult } from "shared/dist";

const app = new Hono();

app.use(cors());

const likes: Record<string, number[]> = {};
const movieCache: Record<number, Movie> = {};

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;

app.get("/movies", async (c) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/all/week?language=ru-RU&api_key=${TMDB_KEY}`,
  );
  if (!res.ok) {
    const error = await res.text();
    return c.json({ error }, 500);
  }

  const data = await res.json();
  if (!data.results) {
    return c.json({ error: "No results in TMDB response", data }, 500);
  }

  const movies: Movie[] = data.results.map((m: any) => ({
    id: m.id,
    title: m.title,
    poster_path: m.poster_path,
    overview: m.overview,
  }));
  movies.forEach((m) => (movieCache[m.id] = m));
  return c.json(movies);
});

app.post("/like", async (c) => {
  const body = await c.req.json<Like>();
  likes[body.email] ||= [];
  if (!likes[body.email].includes(body.movieId)) {
    likes[body.email].push(body.movieId);
  }
  return c.json({ success: true });
});

app.get("/match", (c) => {
  const email = c.req.query("email");
  const otherEmails = Object.keys(likes).filter((e) => e !== email);
  const userLikes = likes[email] || [];

  for (const other of otherEmails) {
    const intersection = userLikes.filter((id) => likes[other].includes(id));
    if (intersection.length) {
      const matchedMovie = movieCache[intersection[0]];
      return c.json<MatchResult>({ matched: true, movie: matchedMovie });
    }
  }
  return c.json<MatchResult>({ matched: false });
});

export default app;
