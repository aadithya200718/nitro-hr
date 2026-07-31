import { z } from '@nitrostack/core';

/**
 * Meeting Schemas
 *
 * Zod schemas and TypeScript types for the Meeting module.
 */

export const ScheduleMeetingSchema = z.object({
  employeeId: z.string().describe('Employee ID who the meeting is for (e.g., E001)'),
  title: z.string().describe('Meeting title or topic (e.g., "Team Sync", "1-on-1 with Manager")'),
  date: z.string().describe('Meeting date (YYYY-MM-DD)'),
  time: z.string().describe('Meeting start time (HH:MM in 24h format, e.g., "14:00")'),
  duration: z.number().default(60).describe('Meeting duration in minutes (default: 60)'),
  attendees: z.array(z.string()).optional().describe('List of additional attendee employee IDs'),
});

export const CancelMeetingSchema = z.object({
  meetingId: z.string().describe('Meeting ID to cancel (e.g., M0001)'),
});

export const GetMeetingsSchema = z.object({
  employeeId: z.string().describe('Employee ID to get meetings for (e.g., E001)'),
});

export interface Meeting {
  id: string;
  employeeId: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  attendees: string[];
  status: 'scheduled' | 'cancelled';
  createdAt: string;
}
