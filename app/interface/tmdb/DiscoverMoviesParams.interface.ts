export interface DiscoverMoviesParams {
  include_adult?: boolean;
  include_video?: boolean;
  language?: string;
  page?: number;
  sort_by?:
    | "popularity.desc"
    | "popularity.asc"
    | "release_date.desc"
    | "release_date.asc"
    | "vote_average.desc"
    | "vote_average.asc";
  with_genres?: string;
  year?: number;
}
