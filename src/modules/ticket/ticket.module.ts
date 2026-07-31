import { Module } from '@nitrostack/core';
import { TicketService } from './ticket.service.js';
import { TicketTools } from './ticket.tools.js';
import { TicketResources } from './ticket.resources.js';

@Module({
  name: 'ticket',
  description: 'IT ticketing — create, update, list, and track equipment requests',
  controllers: [TicketTools, TicketResources],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
