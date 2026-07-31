import { z } from '@nitrostack/core';

/**
 * Leave Schemas
 *
 * Zod schemas and TypeScript types for the Leave module.
 */

export const ApplyLeaveSchema = z.object({
  employeeId: z.string().describe('Employee ID (e.g., E001)'),
  leaveType: z.enum(['annual', 'sick', 'personal', 'maternity', 'paternity']).describe('Type of leave'),
  startDate: z.string().describe('Start date of leave (YYYY-MM-DD)'),
  endDate: z.string().describe('End date of leave (YYYY-MM-DD)'),
  reason: z.string().describe('Reason for taking leave'),
});

export const GetLeaveBalanceSchema = z.object({
  employeeId: z.string().describe('Employee ID (e.g., E001)'),
});

export const GetLeaveHistorySchema = z.object({
  employeeId: z.string().describe('Employee ID (e.g., E001)'),
});

export interface LeaveBalance {
  annual: number;
  sick: number;
  personal: number;
  maternity: number;
  paternity: number;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
}
