import { ControllerDecorator as Controller, ToolDecorator as Tool, Widget, ExecutionContext, UseGuards } from '@nitrostack/core';
import { EmployeeService } from '../employee/employee.service.js';
import { LeaveService } from '../leave/leave.service.js';
import { MeetingService } from '../meeting/meeting.service.js';
import { TicketService } from '../ticket/ticket.service.js';
import { EmailService } from '../email/email.service.js';
import { OnboardEmployeeSchema } from './onboarding.schemas.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';

/**
 * Onboarding Tools
 *
 * Single orchestrating tool that performs a complete new-hire onboarding
 * by coordinating across all other services via dependency injection.
 */
@Controller('hr')
export class OnboardingTools {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly leaveService: LeaveService,
    private readonly meetingService: MeetingService,
    private readonly ticketService: TicketService,
    private readonly emailService: EmailService
  ) {}

  @Tool({
    name: 'onboard_employee',
    description:
      'Fully onboard a new employee in a single step: creates HR profile, initializes leave balance, sends welcome email, notifies their manager, raises IT equipment tickets, and schedules an introductory meeting.',
    inputSchema: OnboardEmployeeSchema,
  })
  @Widget('onboarding-summary')
  @UseGuards(ApiKeyGuard)
  async onboardEmployee(
    input: {
      name: string;
      email: string;
      department: string;
      role: string;
      managerId: string;
      equipment: string[];
    },
    ctx: ExecutionContext
  ) {
    const steps: string[] = [];

    // Step 1: Create employee record
    const employee = this.employeeService.add({
      name: input.name,
      email: input.email,
      department: input.department,
      role: input.role,
      managerId: input.managerId,
    });
    steps.push(`✅ Employee ${employee.name} created with ID ${employee.id}`);

    // Step 2: Initialize leave balance
    this.leaveService.initBalance(employee.id);
    steps.push(`✅ Leave balance initialized (Annual: 20, Sick: 10, Personal: 5 days)`);

    // Step 3: Send welcome email
    const welcomeHtml = this.emailService.welcomeEmail(employee.name, employee.id);
    const welcomeResult = await this.emailService.send(employee.email, `Welcome to the Team, ${employee.name}!`, welcomeHtml);
    steps.push(`✅ Welcome email sent to ${employee.email}`);

    // Step 4: Notify manager
    const manager = this.employeeService.getById(input.managerId);
    if (manager) {
      const managerHtml = this.emailService.managerNotificationEmail(manager.name, employee.name, employee.id);
      await this.emailService.send(manager.email, `New Team Member: ${employee.name}`, managerHtml);
      steps.push(`✅ Manager ${manager.name} (${manager.id}) notified via email`);
    } else {
      steps.push(`⚠️ Manager ${input.managerId} not found — notification skipped`);
    }

    // Step 5: Raise IT equipment tickets
    const tickets = input.equipment.map((item) => {
      const ticket = this.ticketService.create({
        employeeId: employee.id,
        item,
        priority: 'high',
        notes: `Auto-provisioned during onboarding of ${employee.name}`,
      });
      return ticket;
    });
    steps.push(`✅ ${tickets.length} IT ticket(s) created: ${tickets.map((t) => `${t.id} (${t.item})`).join(', ')}`);

    // Step 6: Schedule introductory meeting
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const meetingDate = tomorrow.toISOString().split('T')[0];

    let meeting;
    try {
      meeting = this.meetingService.schedule({
        employeeId: employee.id,
        title: `Introductory Meeting — ${employee.name}`,
        date: meetingDate,
        time: '10:00',
        duration: 60,
        attendees: manager ? [manager.id] : [],
      });
      steps.push(`✅ Introductory meeting scheduled for ${meetingDate} at 10:00 AM`);
    } catch {
      steps.push(`⚠️ Could not schedule introductory meeting — possible time conflict`);
    }

    ctx.logger.info(`Onboarding complete for ${employee.name} (${employee.id})`);

    return {
      success: true,
      message: `🚀 Onboarding complete for ${employee.name} (${employee.id})!`,
      summary: steps,
      employee,
      tickets: tickets.map((t) => ({ id: t.id, item: t.item, status: t.status })),
      meeting: meeting ? { id: meeting.id, date: meeting.date, time: meeting.time } : null,
    };
  }
}
