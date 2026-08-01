import { z } from '@nitrostack/core';

/**
 * Onboarding Schemas
 *
 * Zod schemas for the one-shot onboarding orchestration tool.
 */

export const OnboardEmployeeSchema = z.object({
  name: z.string().describe('Full name of the new employee'),
  email: z.string().email().describe('Employee email address'),
  department: z.string().describe('Department name (e.g., Engineering, HR, Marketing)'),
  role: z.string().describe('Job title (e.g., Software Engineer, HR Manager)'),
  managerId: z.string().describe('Reporting manager employee ID (e.g., E001)'),
  equipment: z
    .array(
      z.enum([
        'Laptop', 'MacBook Pro', 'Monitor', '27-inch Monitor',
        'Keyboard', 'Mouse', 'Headset', 'Webcam', 'Docking Station',
        'Desktop', 'ID Card', 'Office Supplies', 'Software License',
      ])
    )
    .default(['Laptop', 'ID Card'])
    .describe('Equipment items to provision for the new employee'),
});
