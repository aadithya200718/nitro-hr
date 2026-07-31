import { ControllerDecorator as Controller, ToolDecorator as Tool, Widget, ExecutionContext, UseGuards } from '@nitrostack/core';
import { TicketService } from './ticket.service.js';
import { CreateTicketSchema, UpdateTicketSchema, GetTicketsSchema } from './ticket.schemas.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';

/**
 * Ticket Tools
 *
 * MCP tools for IT equipment ticketing — create, update, and list tickets.
 */
@Controller('hr')
export class TicketTools {
  constructor(private readonly ticketService: TicketService) {}

  @Tool({
    name: 'create_ticket',
    description:
      'Create a new IT equipment provisioning ticket. Supported items: Laptop, Monitor, Keyboard, Mouse, Headset, ID Card, Office Supplies, Software License.',
    inputSchema: CreateTicketSchema,
  })
  @UseGuards(ApiKeyGuard)
  async createTicket(
    input: { employeeId: string; item: string; priority?: string; notes?: string },
    ctx: ExecutionContext
  ) {
    const ticket = this.ticketService.create(input);
    ctx.logger.info(`Ticket created: ${ticket.id} - ${ticket.item} for ${ticket.employeeId}`);
    return {
      success: true,
      message: `IT ticket ${ticket.id} created for ${ticket.item} (${ticket.priority} priority) for employee ${ticket.employeeId}.`,
      ticket,
    };
  }

  @Tool({
    name: 'update_ticket',
    description:
      'Update an IT ticket status. Valid statuses: Open → In Progress → Resolved → Closed.',
    inputSchema: UpdateTicketSchema,
  })
  @UseGuards(ApiKeyGuard)
  async updateTicket(
    input: { ticketId: string; status: string; notes?: string },
    ctx: ExecutionContext
  ) {
    try {
      const ticket = this.ticketService.update(input.ticketId, input);
      ctx.logger.info(`Ticket updated: ${ticket.id} → ${ticket.status}`);
      return {
        success: true,
        message: `Ticket ${ticket.id} updated to "${ticket.status}".`,
        ticket,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Tool({
    name: 'get_tickets',
    description:
      'List IT tickets. Optionally filter by employee ID and/or status (Open, In Progress, Resolved, Closed).',
    inputSchema: GetTicketsSchema,
  })
  @Widget('ticket-board')
  async getTickets(
    input: { employeeId?: string; status?: string },
    ctx: ExecutionContext
  ) {
    const tickets = this.ticketService.getAll(input);

    if (tickets.length === 0) {
      return {
        success: true,
        message: 'No tickets found matching the given filters.',
        tickets: [],
      };
    }

    return {
      success: true,
      totalTickets: tickets.length,
      tickets,
    };
  }
}
