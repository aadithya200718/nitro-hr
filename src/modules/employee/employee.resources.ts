import { ControllerDecorator as Controller, ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { EmployeeService } from './employee.service.js';

/**
 * Employee Resources
 *
 * Read-only MCP resources exposing employee profiles and the org chart.
 */
@Controller()
export class EmployeeResources {
  constructor(private readonly employeeService: EmployeeService) {}

  @Resource({
    uri: 'employee://{id}',
    name: 'Employee Profile',
    description: 'Employee details including role, department, and reporting manager.',
    mimeType: 'application/json',
  })
  async getEmployeeProfile(ctx: ExecutionContext) {
    // Parse the employee ID from the resource URI
    const uri = ctx.metadata?.['uri'] as string | undefined;
    const id = uri ? uri.replace('employee://', '').toUpperCase() : '';
    const employee = this.employeeService.getById(id);

    if (!employee) {
      return { error: `Employee not found: ${id}` };
    }

    const manager = employee.managerId
      ? this.employeeService.getById(employee.managerId)
      : undefined;

    return {
      ...employee,
      managerName: manager?.name || null,
    };
  }

  @Resource({
    uri: 'org://chart',
    name: 'Organization Chart',
    description: 'Complete organizational hierarchy showing all employees and their reporting structure.',
    mimeType: 'application/json',
  })
  async getOrgChart(ctx: ExecutionContext) {
    return this.employeeService.getOrgChart();
  }
}
