import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Optional } from '@nestjs/common';
import { Queue } from 'bullmq';
import { CachedUserSnapshot } from './auth-token-cache.service';
import { USER_STATE_JOB, USER_STATE_QUEUE } from '../constants/user-state.queue';

@Injectable()
export class UserStateQueueService {
  constructor(
    @InjectQueue(USER_STATE_QUEUE)
    @Optional()
    private readonly queue?: Queue,
  ) {}

  async enqueueSnapshotUpdate(snapshot: CachedUserSnapshot): Promise<void> {
    if (!this.queue) {
      return;
    }
    await this.queue.add(USER_STATE_JOB.SNAPSHOT_UPDATED, { snapshot });
  }

  async enqueueInvalidateTokens(userId: string): Promise<void> {
    if (!this.queue) {
      return;
    }
    await this.queue.add(USER_STATE_JOB.INVALIDATE_TOKENS, { userId });
  }
}
