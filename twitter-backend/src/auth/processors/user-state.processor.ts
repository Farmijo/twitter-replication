import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AuthTokenCacheService } from '../services/auth-token-cache.service';
import { USER_STATE_JOB, USER_STATE_QUEUE, UserInvalidateTokensJob, UserSnapshotUpdatedJob } from '../constants/user-state.queue';

type UserStateJobPayload = UserSnapshotUpdatedJob | UserInvalidateTokensJob;

@Injectable()
@Processor(USER_STATE_QUEUE)
export class UserStateProcessor extends WorkerHost {
  private readonly logger = new Logger(UserStateProcessor.name);

  constructor(private readonly authTokenCacheService: AuthTokenCacheService) {
    super();
  }

  async process(job: Job<UserStateJobPayload>): Promise<void> {
    switch (job.name) {
      case USER_STATE_JOB.SNAPSHOT_UPDATED:
        await this.handleSnapshotUpdated(job as Job<UserSnapshotUpdatedJob>);
        break;
      case USER_STATE_JOB.INVALIDATE_TOKENS:
        await this.handleInvalidateTokens(job as Job<UserInvalidateTokensJob>);
        break;
      default:
        this.logger.warn(`Received unknown job: ${job.name}`);
    }
  }

  private async handleSnapshotUpdated(job: Job<UserSnapshotUpdatedJob>): Promise<void> {
    const snapshot = job.data?.snapshot;
    if (!snapshot) {
      this.logger.warn('Received snapshot update job without snapshot data');
      return;
    }

    await this.authTokenCacheService.updateUserSnapshot(snapshot);
  }

  private async handleInvalidateTokens(job: Job<UserInvalidateTokensJob>): Promise<void> {
    const userId = job.data?.userId;
    if (!userId) {
      this.logger.warn('Received invalidate tokens job without userId');
      return;
    }

    await this.authTokenCacheService.invalidateAllTokensForUser(userId);
  }
}
