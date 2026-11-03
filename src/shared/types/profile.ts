/** A single browser-local profile; this is NOT a remote identity or secure authentication. */
export interface LocalProfile {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  about: string;
  createdAt: string;
  avatar?: string;
}

export interface ProfileUpdate {
  name: string;
  nickname?: string;
  email: string;
  about: string;
}
