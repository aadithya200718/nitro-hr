import { ControllerDecorator as Controller, ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { LeaveService } from './leave.service.js';

/**
 * Leave Resources
 *
 * Read-only MCP resource exposing leave balance and history per employee.
 */
@Controller()
export class LeaveResources {
  constructor(private readonly leaveService: LeaveService) {}

  @Resource({
    uri: 'leave://{employeeId}',
    name: 'Employee Leave Info',
    description: 'Leave balance and history for a specific employee.',
    mimeType: 'application/json',
  })
  async getLeaveInfo(ctx: ExecutionContext) {
    const uri = ctx.metadata?.['uri'] as string | undefined;
    const employeeId = uri ? uri.replace('leave://', '').toUpperCase() : '';
    const balance = this.leaveService.getBalance(employeeId);
    const history = this.leaveService.getHistory(employeeId);

    if (!balance) {
      return { error: `No leave data found for employee ${employeeId}` };
    }

    return {
      employeeId,
      balance,
      history,
    };
  }
}
