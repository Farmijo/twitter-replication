export interface FollowSummary {
  id: string;
  username?: string;
  email?: string;
  profileImage?: string;
  followersCount?: number;
  followingCount?: number;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
