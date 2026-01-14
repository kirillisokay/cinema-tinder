import type {
  DiscoverMoviesParams,
  DiscoverMoviesResponse,
  Movie,
} from "@/interface";

export const useTMDB = () => {
  const config = useRuntimeConfig();
  const baseUrl = "https://api.themoviedb.org/3";

  const getHeaders = () => ({
    accept: "application/json",
    Authorization: `Bearer ${config.public.tmdbApiKey}`,
  });

  const discoverMovies = async (
    params?: DiscoverMoviesParams,
  ): Promise<DiscoverMoviesResponse> => {
    const defaultParams: DiscoverMoviesParams = {
      include_adult: false,
      include_video: false,
      language: "ru-RU",
      page: Math.floor(Math.random() * 500) + 1,
      sort_by: "popularity.desc",
    };

    const mergedParams = { ...defaultParams, ...params };

    try {
      const data = await $fetch<DiscoverMoviesResponse>(
        `${baseUrl}/discover/movie`,
        {
          method: "GET",
          headers: getHeaders(),
          query: mergedParams,
        },
      );

      return data;
    } catch (error: any) {
      throw new Error(`TMDB API error: ${error.message}`);
    }
  };

  const searchMovies = async (
    query: string,
    page: number = 1,
  ): Promise<DiscoverMoviesResponse> => {
    try {
      const data = await $fetch<DiscoverMoviesResponse>(
        `${baseUrl}/search/movie`,
        {
          method: "GET",
          headers: getHeaders(),
          query: {
            query,
            page,
            include_adult: false,
            language: "en-US",
          },
        },
      );

      return data;
    } catch (error: any) {
      throw new Error(`TMDB API error: ${error.message}`);
    }
  };

  const getMovieDetails = async (movieId: number): Promise<Movie> => {
    try {
      const data = await $fetch<Movie>(`${baseUrl}/movie/${movieId}`, {
        method: "GET",
        headers: getHeaders(),
        query: {
          language: "en-US",
        },
      });

      return data;
    } catch (error: any) {
      throw new Error(`TMDB API error: ${error.message}`);
    }
  };

  const getImageUrl = (
    path: string | null,
    size: "w500" | "original" = "w500",
  ): string | null => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  return {
    discoverMovies,
    searchMovies,
    getMovieDetails,
    getImageUrl,
  };
};
