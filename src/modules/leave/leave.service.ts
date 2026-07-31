import { Injectable } from '@nitrostack/core';
import { LeaveBalance, LeaveRecord } from './leave.schemas.js';

/**
 * Leave Service
 *
 * Business logic for leave balance tracking, applying leaves,
 * and maintaining leave history. Uses in-memory storage.
 */
@Injectable()
export class LeaveService {
  private balances = new Map<string, LeaveBalance>();
  private history = new Map<string, LeaveRecord[]>();
  private nextLeaveId = 1;

  /**
   * Initialize leave balance for an employee.
   */
  initBalance(employeeId: string, balance?: Partial<LeaveBalance>): void {
    this.balances.set(employeeId, {
      annual: balance?.annual ?? 20,
      sick: balance?.sick ?? 10,
      personal: balance?.personal ?? 5,
      maternity: balance?.maternity ?? 90,
      paternity: balance?.paternity ?? 15,
    });
    if (!this.history.has(employeeId)) {
      this.history.set(employeeId, []);
    }
  }

  /**
   * Get leave balance for an employee.
   */
  getBalance(employeeId: string): LeaveBalance | undefined {
    return this.balances.get(employeeId);
  }

  /**
   * Get leave history for an employee.
   */
  getHistory(employeeId: string): LeaveRecord[] {
    return this.history.get(employeeId) || [];
  }

  /**
   * Apply for leave — validates balance and deducts days.
   */
  applyLeave(data: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }): LeaveRecord {
    const balance = this.balances.get(data.employeeId);
    if (!balance) {
      throw new Error(`No leave balance found for employee ${data.employeeId}. Employee may not exist.`);
    }

    // Calculate days
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check balance
    const leaveTypeKey = data.leaveType as keyof LeaveBalance;
    if (balance[leaveTypeKey] === undefined) {
      throw new Error(`Invalid leave type: ${data.leaveType}`);
    }
    if (balance[leaveTypeKey] < days) {
      throw new Error(
        `Insufficient ${data.leaveType} leave balance. Available: ${balance[leaveTypeKey]} days, Requested: ${days} days.`
      );
    }

    // Deduct balance
    balance[leaveTypeKey] -= days;

    // Create record
    const record: LeaveRecord = {
      id: `L${String(this.nextLeaveId++).padStart(4, '0')}`,
      employeeId: data.employeeId,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      days,
      reason: data.reason,
      status: 'approved', // Auto-approve for demo purposes
      appliedOn: new Date().toISOString().split('T')[0],
    };

    const records = this.history.get(data.employeeId) || [];
    records.push(record);
    this.history.set(data.employeeId, records);

    return record;
  }

  /**
   * Set next leave ID (used by SeedService).
   */
  setNextLeaveId(id: number): void {
    this.nextLeaveId = id;
  }

  /**
   * Add a historical leave record (used by SeedService).
   */
  addHistoricalRecord(record: LeaveRecord): void {
    const records = this.history.get(record.employeeId) || [];
    records.push(record);
    this.history.set(record.employeeId, records);
  }
}
