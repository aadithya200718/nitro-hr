import { Injectable } from '@nitrostack/core';
import { Ticket } from './ticket.schemas.js';

/**
 * Ticket Service
 *
 * Business logic for IT equipment ticketing — create, update, list,
 * and filter tickets. Uses T0001-style IDs and in-memory storage.
 */
@Injectable()
export class TicketService {
  private tickets = new Map<string, Ticket>();
  private nextId = 1;

  /**
   * Create a new IT equipment ticket.
   */
  create(data: {
    employeeId: string;
    item: string;
    priority?: string;
    notes?: string;
  }): Ticket {
    const id = `T${String(this.nextId++).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const ticket: Ticket = {
      id,
      employeeId: data.employeeId,
      item: data.item,
      priority: data.priority || 'medium',
      status: 'Open',
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    this.tickets.set(id, ticket);
    return ticket;
  }

  /**
   * Update a ticket's status and/or notes.
   */
  update(ticketId: string, data: { status: string; notes?: string }): Ticket {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket not found: ${ticketId}`);
    }

    ticket.status = data.status as Ticket['status'];
    if (data.notes) {
      ticket.notes = ticket.notes
        ? `${ticket.notes}\n[${new Date().toISOString().split('T')[0]}] ${data.notes}`
        : data.notes;
    }
    ticket.updatedAt = new Date().toISOString();

    return ticket;
  }

  /**
   * Get a ticket by ID.
   */
  getById(ticketId: string): Ticket | undefined {
    return this.tickets.get(ticketId);
  }

  /**
   * Get all tickets, optionally filtered by employee and/or status.
   */
  getAll(filters?: { employeeId?: string; status?: string }): Ticket[] {
    let tickets = Array.from(this.tickets.values());

    if (filters?.employeeId) {
      tickets = tickets.filter((t) => t.employeeId === filters.employeeId);
    }
    if (filters?.status) {
      tickets = tickets.filter((t) => t.status === filters.status);
    }

    return tickets;
  }

  /**
   * Set next ticket ID (used by SeedService).
   */
  setNextId(id: number): void {
    this.nextId = id;
  }
}
