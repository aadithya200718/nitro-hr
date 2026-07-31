import { Injectable } from '@nitrostack/core';
import { Meeting } from './meeting.schemas.js';

/**
 * Meeting Service
 *
 * Business logic for scheduling, cancelling, and listing meetings
 * with built-in conflict detection. Uses in-memory storage.
 */
@Injectable()
export class MeetingService {
  private meetings = new Map<string, Meeting>();
  private nextId = 1;

  /**
   * Schedule a new meeting with conflict detection.
   */
  schedule(data: {
    employeeId: string;
    title: string;
    date: string;
    time: string;
    duration?: number;
    attendees?: string[];
  }): Meeting {
    const duration = data.duration || 60;

    // Conflict detection: check for overlapping meetings
    const conflict = this.checkConflict(data.employeeId, data.date, data.time, duration);
    if (conflict) {
      throw new Error(
        `Meeting conflict detected! ${data.employeeId} already has "${conflict.title}" scheduled on ${conflict.date} at ${conflict.time}.`
      );
    }

    const id = `M${String(this.nextId++).padStart(4, '0')}`;
    const meeting: Meeting = {
      id,
      employeeId: data.employeeId,
      title: data.title,
      date: data.date,
      time: data.time,
      duration,
      attendees: data.attendees || [],
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    this.meetings.set(id, meeting);
    return meeting;
  }

  /**
   * Cancel a meeting by ID.
   */
  cancel(meetingId: string): Meeting {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) {
      throw new Error(`Meeting not found: ${meetingId}`);
    }
    if (meeting.status === 'cancelled') {
      throw new Error(`Meeting ${meetingId} is already cancelled.`);
    }
    meeting.status = 'cancelled';
    return meeting;
  }

  /**
   * Get all meetings for an employee.
   */
  getByEmployee(employeeId: string): Meeting[] {
    return Array.from(this.meetings.values()).filter(
      (m) => m.employeeId === employeeId || m.attendees.includes(employeeId)
    );
  }

  /**
   * Get a meeting by its ID.
   */
  getById(meetingId: string): Meeting | undefined {
    return this.meetings.get(meetingId);
  }

  /**
   * Check if scheduling a meeting would conflict with existing ones.
   */
  private checkConflict(
    employeeId: string,
    date: string,
    time: string,
    duration: number
  ): Meeting | null {
    const employeeMeetings = this.getByEmployee(employeeId).filter(
      (m) => m.status === 'scheduled' && m.date === date
    );

    const newStart = this.timeToMinutes(time);
    const newEnd = newStart + duration;

    for (const meeting of employeeMeetings) {
      const existingStart = this.timeToMinutes(meeting.time);
      const existingEnd = existingStart + meeting.duration;

      // Check overlap
      if (newStart < existingEnd && newEnd > existingStart) {
        return meeting;
      }
    }

    return null;
  }

  /**
   * Convert HH:MM time string to minutes since midnight.
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Set next meeting ID (used by SeedService).
   */
  setNextId(id: number): void {
    this.nextId = id;
  }
}
