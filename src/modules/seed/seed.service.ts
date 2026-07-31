import { Injectable, OnModuleInit } from '@nitrostack/core';
import { EmployeeService } from '../employee/employee.service.js';
import { LeaveService } from '../leave/leave.service.js';
import { MeetingService } from '../meeting/meeting.service.js';
import { TicketService } from '../ticket/ticket.service.js';

/**
 * Seed Service
 *
 * Populates the in-memory data stores with sample HR data on application boot.
 * Creates 8 employees with reporting hierarchy, leave balances, sample meetings,
 * and IT tickets — matching the original Python HR Assistant demo dataset.
 */
@Injectable({ deps: [EmployeeService, LeaveService, MeetingService, TicketService] })
export class SeedService implements OnModuleInit {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly leaveService: LeaveService,
    private readonly meetingService: MeetingService,
    private readonly ticketService: TicketService
  ) {}

  async onModuleInit(): Promise<void> {
    this.seedEmployees();
    this.seedLeaveBalances();
    this.seedMeetings();
    this.seedTickets();
    console.error('[SeedService] ✅ Sample HR data loaded (8 employees, leave balances, meetings, tickets)');
  }

  private seedEmployees(): void {
    const employees = [
      { name: 'Sarah Johnson', email: 'sarah.johnson@bluparrot.in', department: 'Engineering', role: 'VP of Engineering', managerId: undefined },
      { name: 'Michael Chen', email: 'michael.chen@bluparrot.in', department: 'Engineering', role: 'Senior Software Engineer', managerId: 'E001' },
      { name: 'David Wilson', email: 'david.wilson@bluparrot.in', department: 'Engineering', role: 'Software Engineer', managerId: 'E001' },
      { name: 'Tony Sharma', email: 'tony.sharma@bluparrot.in', department: 'Product', role: 'Product Manager', managerId: 'E001' },
      { name: 'Emily Davis', email: 'emily.davis@bluparrot.in', department: 'HR', role: 'HR Director', managerId: undefined },
      { name: 'Priya Patel', email: 'priya.patel@bluparrot.in', department: 'HR', role: 'HR Coordinator', managerId: 'E005' },
      { name: 'Robert Kim', email: 'robert.kim@bluparrot.in', department: 'Marketing', role: 'Marketing Manager', managerId: undefined },
      { name: 'James Smith', email: 'james.smith@bluparrot.in', department: 'Marketing', role: 'Content Strategist', managerId: 'E007' },
    ];

    for (const emp of employees) {
      this.employeeService.add(emp);
    }

    // Set next ID to E009 so new employees continue from there
    this.employeeService.setNextId(9);
  }

  private seedLeaveBalances(): void {
    const balances: Record<string, { annual: number; sick: number; personal: number }> = {
      E001: { annual: 18, sick: 10, personal: 5 },
      E002: { annual: 15, sick: 8, personal: 4 },
      E003: { annual: 20, sick: 10, personal: 5 },
      E004: { annual: 12, sick: 7, personal: 3 },
      E005: { annual: 16, sick: 9, personal: 5 },
      E006: { annual: 20, sick: 10, personal: 5 },
      E007: { annual: 14, sick: 6, personal: 4 },
      E008: { annual: 19, sick: 10, personal: 5 },
    };

    for (const [empId, balance] of Object.entries(balances)) {
      this.leaveService.initBalance(empId, balance);
    }

    // Add some historical leave records
    this.leaveService.addHistoricalRecord({
      id: 'L0001',
      employeeId: 'E002',
      leaveType: 'annual',
      startDate: '2026-03-10',
      endDate: '2026-03-14',
      days: 5,
      reason: 'Family vacation',
      status: 'approved',
      appliedOn: '2026-02-28',
    });

    this.leaveService.addHistoricalRecord({
      id: 'L0002',
      employeeId: 'E004',
      leaveType: 'sick',
      startDate: '2026-05-20',
      endDate: '2026-05-22',
      days: 3,
      reason: 'Flu recovery',
      status: 'approved',
      appliedOn: '2026-05-19',
    });

    this.leaveService.addHistoricalRecord({
      id: 'L0003',
      employeeId: 'E007',
      leaveType: 'annual',
      startDate: '2026-06-01',
      endDate: '2026-06-06',
      days: 6,
      reason: 'International trip',
      status: 'approved',
      appliedOn: '2026-05-15',
    });

    this.leaveService.setNextLeaveId(4);
  }

  private seedMeetings(): void {
    const meetings = [
      {
        employeeId: 'E001',
        title: 'Engineering All-Hands',
        date: '2026-08-04',
        time: '10:00',
        duration: 60,
        attendees: ['E002', 'E003', 'E004'],
      },
      {
        employeeId: 'E001',
        title: '1-on-1 with Michael Chen',
        date: '2026-08-05',
        time: '14:00',
        duration: 30,
        attendees: ['E002'],
      },
      {
        employeeId: 'E005',
        title: 'HR Policy Review',
        date: '2026-08-04',
        time: '11:00',
        duration: 90,
        attendees: ['E006'],
      },
      {
        employeeId: 'E007',
        title: 'Marketing Strategy Q3',
        date: '2026-08-06',
        time: '09:00',
        duration: 120,
        attendees: ['E008'],
      },
    ];

    for (const m of meetings) {
      this.meetingService.schedule(m);
    }

    this.meetingService.setNextId(5);
  }

  private seedTickets(): void {
    const tickets = [
      { employeeId: 'E003', item: 'Monitor', priority: 'medium', notes: 'Dual monitor setup for development' },
      { employeeId: 'E006', item: 'Laptop', priority: 'high', notes: 'New hire equipment — MacBook Pro' },
      { employeeId: 'E008', item: 'Software License', priority: 'low', notes: 'Adobe Creative Suite license' },
    ];

    for (const t of tickets) {
      this.ticketService.create(t);
    }

    this.ticketService.setNextId(4);
  }
}
