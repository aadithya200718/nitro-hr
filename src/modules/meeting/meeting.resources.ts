import { ControllerDecorator as Controller, ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { MeetingService } from './meeting.service.js';

/**
 * Meeting Resources
 *
 * Read-only MCP resource exposing meeting schedules per employee.
 */
@Controller()
export class MeetingResources {
  constructor(private readonly meetingService: MeetingService) {}

  @Resource({
    uri: 'meetings://{employeeId}',
    name: 'Employee Meetings',
    description: 'All scheduled and cancelled meetings for a specific employee.',
    mimeType: 'application/json',
  })
  async getEmployeeMeetings(ctx: ExecutionContext) {
    const uri = ctx.metadata?.['uri'] as string | undefined;
    const employeeId = uri ? uri.replace('meetings://', '').toUpperCase() : '';
    const meetings = this.meetingService.getByEmployee(employeeId);

    return {
      employeeId,
      totalMeetings: meetings.length,
      meetings,
    };
  }
}
