import type { Peer } from "crossws";
import type { Movie } from "~/interface/tmdb";

export interface MatchRoom {
  roomId: string;
  user1?: string;
  user2?: string;
  sockets: {
    user1?: Peer;
    user2?: Peer;
  };
  likes: {
    user1: Set<string>;
    user2: Set<string>;
  };
  movieList?: Movie[];
  currentIndex?: number;
}
