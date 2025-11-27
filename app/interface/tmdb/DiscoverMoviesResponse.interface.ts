import type { Movie } from "./Movie.interface";

export interface DiscoverMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
