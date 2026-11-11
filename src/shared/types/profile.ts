/** Shape accepted by the public account editor. Email changes are not supported by backend v1. */
export interface ProfileUpdate {
  name: string;
  nickname?: string;
  about: string;
}
export type LocalProfile = import('@/shared/api/types').PublicUser;
