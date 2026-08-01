import { z } from '@nitrostack/core';

/**
 * Ticket Schemas
 *
 * Zod schemas and TypeScript types for the IT Ticketing module.
 */

export const CreateTicketSchema = z.object({
  employeeId: z.string().describe('Employee ID requesting the equipment (e.g., E001)'),
  item: z
    .enum([
      'Laptop', 'MacBook Pro', 'Monitor', '27-inch Monitor',
      'Keyboard', 'Mouse', 'Headset', 'Webcam', 'Docking Station',
      'Desktop', 'ID Card', 'Office Supplies', 'Software License',
    ])
    .describe('Type of equipment or item being requested'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium').describe('Ticket priority level'),
  notes: z.string().optional().describe('Additional notes or specifications'),
});

export const UpdateTicketSchema = z.object({
  ticketId: z.string().describe('Ticket ID to update (e.g., T0001)'),
  status: z
    .enum(['Open', 'In Progress', 'Resolved', 'Closed'])
    .describe('New status for the ticket'),
  notes: z.string().optional().describe('Update notes or comments'),
});

export const GetTicketsSchema = z.object({
  employeeId: z.string().optional().describe('Filter tickets by employee ID'),
  status: z
    .enum(['Open', 'In Progress', 'Resolved', 'Closed'])
    .optional()
    .describe('Filter tickets by status'),
});

export interface Ticket {
  id: string;
  employeeId: string;
  item: string;
  priority: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  notes: string;
  createdAt: string;
  updatedAt: string;
}
