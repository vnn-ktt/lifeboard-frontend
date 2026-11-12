/** Backend v1 public account DTO. No credentials are exposed. */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  nickname: string;
  about: string;
  avatar: string | null;
  avatarFileId: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}
