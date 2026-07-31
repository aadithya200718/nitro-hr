import { Module } from '@nitrostack/core';
import { SeedService } from './seed.service.js';
import { EmployeeModule } from '../employee/employee.module.js';
import { LeaveModule } from '../leave/leave.module.js';
import { MeetingModule } from '../meeting/meeting.module.js';
import { TicketModule } from '../ticket/ticket.module.js';

@Module({
  name: 'seed',
  description: 'Sample data seeding — populates in-memory stores on startup',
  imports: [EmployeeModule, LeaveModule, MeetingModule, TicketModule],
  providers: [SeedService],
})
export class SeedModule {}
