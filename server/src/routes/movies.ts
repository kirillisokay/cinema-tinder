import { Hono } from "hono";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
if (!TMDB_API_KEY) {
  throw new Error("TMDB_API_KEY is required");
}

const BASE_URL = "https://api.themoviedb.org/3";

export const moviesRouter = new Hono();

moviesRouter.get("/discover", async (c) => {
  const response = await fetch(`${BASE_URL}/discover/movie`, {
    params: {
      api_key: TMDB_API_KEY,
      language: "en-US",
      sort_by: "popularity.desc",
      include_adult: false,
      include_video: false,
      page: 1,
    },
  });

  const data = await response.json();
  return json(c, data.results);
});

export default moviesRouter;
