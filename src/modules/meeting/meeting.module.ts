import { Module } from '@nitrostack/core';
import { MeetingService } from './meeting.service.js';
import { MeetingTools } from './meeting.tools.js';
import { MeetingResources } from './meeting.resources.js';

@Module({
  name: 'meeting',
  description: 'Meeting scheduling — schedule, cancel, list, and conflict detection',
  controllers: [MeetingTools, MeetingResources],
  providers: [MeetingService],
  exports: [MeetingService],
})
export class MeetingModule {}
