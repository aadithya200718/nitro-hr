import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, UseGuards } from '@nitrostack/core';
import { LeaveService } from './leave.service.js';
import { ApplyLeaveSchema, GetLeaveBalanceSchema, GetLeaveHistorySchema } from './leave.schemas.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';

/**
 * Leave Tools
 *
 * MCP tools for leave management — apply, check balance, and view history.
 */
@Controller('hr')
export class LeaveTools {
  constructor(private readonly leaveService: LeaveService) {}

  @Tool({
    name: 'apply_leave',
    description:
      'Apply for leave for an employee. Specify employee ID, leave type (annual/sick/personal/maternity/paternity), date range, and reason. Automatically checks and deducts from available balance.',
    inputSchema: ApplyLeaveSchema,
  })
  @UseGuards(ApiKeyGuard)
  async applyLeave(
    input: {
      employeeId: string;
      leaveType: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
      startDate: string;
      endDate: string;
      reason: string;
    },
    ctx: ExecutionContext
  ) {
    try {
      const record = this.leaveService.applyLeave(input);
      ctx.logger.info(`Leave applied: ${record.id} for ${input.employeeId}`);
      return {
        success: true,
        message: `Leave application ${record.id} approved for ${record.days} day(s) of ${record.leaveType} leave.`,
        leaveRecord: record,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Tool({
    name: 'get_leave_balance',
    description: 'Check the remaining leave balance for an employee by their ID.',
    inputSchema: GetLeaveBalanceSchema,
  })
  async getLeaveBalance(input: { employeeId: string }, ctx: ExecutionContext) {
    const balance = this.leaveService.getBalance(input.employeeId);

    if (!balance) {
      return {
        success: false,
        message: `No leave balance found for employee ${input.employeeId}.`,
      };
    }

    const totalRemaining = balance.annual + balance.sick + balance.personal;

    return {
      success: true,
      employeeId: input.employeeId,
      balance,
      totalRemainingDays: totalRemaining,
      message: `Leave balance for ${input.employeeId}: Annual: ${balance.annual}, Sick: ${balance.sick}, Personal: ${balance.personal} days remaining.`,
    };
  }

  @Tool({
    name: 'get_leave_history',
    description: 'View the leave history and past applications for an employee.',
    inputSchema: GetLeaveHistorySchema,
  })
  async getLeaveHistory(input: { employeeId: string }, ctx: ExecutionContext) {
    const history = this.leaveService.getHistory(input.employeeId);

    if (history.length === 0) {
      return {
        success: true,
        message: `No leave history found for employee ${input.employeeId}.`,
        records: [],
      };
    }

    return {
      success: true,
      employeeId: input.employeeId,
      totalRecords: history.length,
      records: history,
    };
  }
}
