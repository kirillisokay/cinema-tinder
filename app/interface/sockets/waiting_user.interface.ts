import type { Peer } from "crossws";

export interface WaitingUser {
  userId: string;
  peer: Peer;
}
