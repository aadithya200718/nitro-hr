import { ControllerDecorator as Controller, ToolDecorator as Tool, Widget, ExecutionContext, UseGuards, z } from '@nitrostack/core';
import { EmployeeService } from './employee.service.js';
import { AddEmployeeSchema, GetEmployeeSchema, SearchEmployeeSchema } from './employee.schemas.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';

/**
 * Employee Tools
 *
 * MCP tools for employee management — add, get, and fuzzy-search employees.
 */
@Controller('hr')
export class EmployeeTools {
  constructor(private readonly employeeService: EmployeeService) {}

  @Tool({
    name: 'add_employee',
    description:
      'Add a new employee to the HR system. Provide the full name, email, department, role, and optionally the reporting manager ID.',
    inputSchema: AddEmployeeSchema,
  })
  @UseGuards(ApiKeyGuard)
  async addEmployee(
    input: { name: string; email: string; department: string; role: string; managerId?: string },
    ctx: ExecutionContext
  ) {
    const employee = this.employeeService.add(input);
    ctx.logger.info(`Added employee: ${employee.id} - ${employee.name}`);
    return {
      success: true,
      message: `Employee ${employee.name} added successfully with ID ${employee.id}`,
      employee,
    };
  }

  @Tool({
    name: 'get_employee',
    description: 'Retrieve detailed information about an employee by their ID (e.g., E001).',
    inputSchema: GetEmployeeSchema,
  })
  async getEmployee(input: { employeeId: string }, ctx: ExecutionContext) {
    const employee = this.employeeService.getById(input.employeeId);
    if (!employee) {
      return {
        success: false,
        message: `Employee not found with ID: ${input.employeeId}. Use search_employee_by_name for fuzzy matching.`,
      };
    }

    const manager = employee.managerId
      ? this.employeeService.getById(employee.managerId)
      : undefined;

    const directReports = this.employeeService.getDirectReports(employee.id);

    return {
      success: true,
      employee,
      manager: manager ? { id: manager.id, name: manager.name } : null,
      directReports: directReports.map((r) => ({ id: r.id, name: r.name, role: r.role })),
    };
  }

  @Tool({
    name: 'search_employee_by_name',
    description: 'Fuzzy-search employees by name. Returns matching employees ranked by similarity.',
    inputSchema: SearchEmployeeSchema,
  })
  async searchEmployee(input: { name: string }, ctx: ExecutionContext) {
    const results = this.employeeService.searchByName(input.name);

    if (results.length === 0) {
      return {
        success: true,
        message: `No employees found matching "${input.name}".`,
        results: [],
      };
    }

    return {
      success: true,
      message: `Found ${results.length} employee(s) matching "${input.name}".`,
      results: results.map((e) => ({
        id: e.id,
        name: e.name,
        email: e.email,
        department: e.department,
        role: e.role,
      })),
    };
  }

  @Tool({
    name: 'get_org_chart',
    description: 'Retrieve the complete organizational hierarchy showing all employees and their reporting structure.',
    inputSchema: z.object({}),
  })
  @Widget('org-chart')
  async getOrgChart(input: Record<string, never>, ctx: ExecutionContext) {
    const chart = this.employeeService.getOrgChart();
    return {
      success: true,
      chart,
    };
  }
}
