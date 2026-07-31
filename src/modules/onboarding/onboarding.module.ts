import { Module } from '@nitrostack/core';
import { OnboardingTools } from './onboarding.tools.js';
import { OnboardingPrompts } from './onboarding.prompts.js';
import { EmployeeModule } from '../employee/employee.module.js';
import { LeaveModule } from '../leave/leave.module.js';
import { MeetingModule } from '../meeting/meeting.module.js';
import { TicketModule } from '../ticket/ticket.module.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  name: 'onboarding',
  description: 'Smart onboarding — single-tool employee onboarding orchestration and prompt templates',
  imports: [EmployeeModule, LeaveModule, MeetingModule, TicketModule, EmailModule],
  controllers: [OnboardingTools, OnboardingPrompts],
})
export class OnboardingModule {}
