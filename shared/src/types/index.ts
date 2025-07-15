export type ApiResponse = {
  message: string;
  success: true;
};

export type Movie = {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
};

export type Like = {
  email: string;
  movieId: number;
};

export type MatchResult = {
  matched: boolean;
  movie?: Movie;
};
