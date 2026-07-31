import { z } from '@nitrostack/core';

/**
 * Employee Schemas
 *
 * Zod schemas and TypeScript types for the Employee module.
 */

export const AddEmployeeSchema = z.object({
  name: z.string().describe('Full name of the employee'),
  email: z.string().email().describe('Employee email address'),
  department: z.string().describe('Department name (e.g., Engineering, HR, Marketing)'),
  role: z.string().describe('Job title or role (e.g., Software Engineer, HR Manager)'),
  managerId: z.string().optional().describe('Reporting manager employee ID (e.g., E001)'),
});

export const GetEmployeeSchema = z.object({
  employeeId: z.string().describe('Employee ID (e.g., E001)'),
});

export const SearchEmployeeSchema = z.object({
  name: z.string().describe('Full or partial name to search for'),
});

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  managerId?: string;
  joinDate: string;
}
