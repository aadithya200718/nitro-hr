import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, UseGuards } from '@nitrostack/core';
import { MeetingService } from './meeting.service.js';
import { ScheduleMeetingSchema, CancelMeetingSchema, GetMeetingsSchema } from './meeting.schemas.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';

/**
 * Meeting Tools
 *
 * MCP tools for meeting scheduling — schedule, cancel, and list meetings.
 */
@Controller('hr')
export class MeetingTools {
  constructor(private readonly meetingService: MeetingService) {}

  @Tool({
    name: 'schedule_meeting',
    description:
      'Schedule a meeting for an employee. Includes automatic conflict detection — will error if the employee already has a meeting at the requested time.',
    inputSchema: ScheduleMeetingSchema,
  })
  @UseGuards(ApiKeyGuard)
  async scheduleMeeting(
    input: {
      employeeId: string;
      title: string;
      date: string;
      time: string;
      duration?: number;
      attendees?: string[];
    },
    ctx: ExecutionContext
  ) {
    try {
      const meeting = this.meetingService.schedule(input);
      ctx.logger.info(`Meeting scheduled: ${meeting.id} for ${input.employeeId}`);
      return {
        success: true,
        message: `Meeting "${meeting.title}" scheduled for ${meeting.employeeId} on ${meeting.date} at ${meeting.time} (${meeting.duration} min).`,
        meeting,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Tool({
    name: 'cancel_meeting',
    description: 'Cancel a scheduled meeting by its meeting ID (e.g., M0001).',
    inputSchema: CancelMeetingSchema,
  })
  @UseGuards(ApiKeyGuard)
  async cancelMeeting(input: { meetingId: string }, ctx: ExecutionContext) {
    try {
      const meeting = this.meetingService.cancel(input.meetingId);
      ctx.logger.info(`Meeting cancelled: ${meeting.id}`);
      return {
        success: true,
        message: `Meeting "${meeting.title}" (${meeting.id}) has been cancelled.`,
        meeting,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Tool({
    name: 'get_meetings',
    description: 'List all meetings (scheduled and cancelled) for an employee.',
    inputSchema: GetMeetingsSchema,
  })
  async getMeetings(input: { employeeId: string }, ctx: ExecutionContext) {
    const meetings = this.meetingService.getByEmployee(input.employeeId);

    if (meetings.length === 0) {
      return {
        success: true,
        message: `No meetings found for employee ${input.employeeId}.`,
        meetings: [],
      };
    }

    const scheduled = meetings.filter((m) => m.status === 'scheduled');
    const cancelled = meetings.filter((m) => m.status === 'cancelled');

    return {
      success: true,
      employeeId: input.employeeId,
      totalMeetings: meetings.length,
      scheduledCount: scheduled.length,
      cancelledCount: cancelled.length,
      meetings,
    };
  }
}
