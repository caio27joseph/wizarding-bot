import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LessThan } from 'typeorm';
import { LearnLogService } from '~/evolution/learn/learn-log.service';

@Injectable()
export class CleanerService {
  constructor(private readonly learnLogService: LearnLogService) {}

  @Cron('0 1 * * 0') // This runs every Sunday at 1AM
  async cleanOlderThanTwoDays() {
    // clean anything older than two days
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    await this.learnLogService.remove({
      createdAt: LessThan(twoDaysAgo),
    });
  }
}
