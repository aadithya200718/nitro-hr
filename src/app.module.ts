import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { EmployeeModule } from './modules/employee/employee.module.js';
import { LeaveModule } from './modules/leave/leave.module.js';
import { MeetingModule } from './modules/meeting/meeting.module.js';
import { TicketModule } from './modules/ticket/ticket.module.js';
import { EmailModule } from './modules/email/email.module.js';
import { OnboardingModule } from './modules/onboarding/onboarding.module.js';
import { SeedModule } from './modules/seed/seed.module.js';
import { SystemHealthCheck } from './health/system.health.js';

/**
 * Root Application Module
 *
 * HR Assistant MCP Server — bootstraps all feature modules for
 * employee management, leave tracking, meeting scheduling,
 * IT ticketing, email automation, and smart onboarding.
 */
@McpApp({
  module: AppModule,
  server: {
    name: 'hr-assistant-server',
    version: '1.0.0',
  },
  logging: {
    level: 'info',
  },
})
@Module({
  name: 'app',
  description: 'HR Assistant MCP Server — root application module',
  imports: [
    ConfigModule.forRoot(),
    EmployeeModule,
    LeaveModule,
    MeetingModule,
    TicketModule,
    EmailModule,
    OnboardingModule,
    SeedModule,
  ],
  providers: [SystemHealthCheck],
})
export class AppModule {}
