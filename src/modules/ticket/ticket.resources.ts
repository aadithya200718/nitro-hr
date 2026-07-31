import { ControllerDecorator as Controller, ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { TicketService } from './ticket.service.js';

/**
 * Ticket Resources
 *
 * Read-only MCP resource exposing individual ticket details.
 */
@Controller()
export class TicketResources {
  constructor(private readonly ticketService: TicketService) {}

  @Resource({
    uri: 'ticket://{ticketId}',
    name: 'IT Ticket Details',
    description: 'Detailed information about a specific IT equipment provisioning ticket.',
    mimeType: 'application/json',
  })
  async getTicketDetails(ctx: ExecutionContext) {
    const uri = ctx.metadata?.['uri'] as string | undefined;
    const ticketId = uri ? uri.replace('ticket://', '').toUpperCase() : '';
    const ticket = this.ticketService.getById(ticketId);

    if (!ticket) {
      return { error: `Ticket not found: ${ticketId}` };
    }

    return ticket;
  }
}
