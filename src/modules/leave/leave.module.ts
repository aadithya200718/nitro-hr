import { Module } from '@nitrostack/core';
import { LeaveService } from './leave.service.js';
import { LeaveTools } from './leave.tools.js';
import { LeaveResources } from './leave.resources.js';

@Module({
  name: 'leave',
  description: 'Leave management — balance tracking, applications, and history',
  controllers: [LeaveTools, LeaveResources],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
