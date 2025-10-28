import { FollowSummary } from '../../domain/models/follow-summary.model';

export interface FollowListDto {
  message: string;
  data: FollowSummaryDto[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
  };
}

export interface FollowSummaryDto {
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

export class FollowResponseMapper {
  static toSummaryDto(summary: FollowSummary): FollowSummaryDto {
    return { ...summary };
  }

  static toSummaryList(summaries: FollowSummary[]): FollowSummaryDto[] {
    return summaries.map(summary => this.toSummaryDto(summary));
  }
}
