import type { CachedUserSnapshot } from '../services/auth-token-cache.service';

export const USER_STATE_QUEUE = 'user-state';

export const USER_STATE_JOB = {
  SNAPSHOT_UPDATED: 'USER_SNAPSHOT_UPDATED',
  INVALIDATE_TOKENS: 'USER_INVALIDATE_TOKENS',
} as const;

export type UserStateJobName = typeof USER_STATE_JOB[keyof typeof USER_STATE_JOB];

export interface UserSnapshotUpdatedJob {
  snapshot: CachedUserSnapshot;
}

export interface UserInvalidateTokensJob {
  userId: string;
}
