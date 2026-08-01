import { ControllerDecorator as Controller, ToolDecorator as Tool, Widget, ExecutionContext, UseGuards, z } from '@nitrostack/core';
import { EmployeeService } from './employee.service.js';
import { AddEmployeeSchema, GetEmployeeSchema, SearchEmployeeSchema, GetTalentInsightsSchema } from './employee.schemas.js';
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

  @Tool({
    name: 'get_talent_insights',
    description: 'Retrieve an AI-generated talent analysis for a specific employee, including skills, sentiment, and flight risk.',
    inputSchema: GetTalentInsightsSchema,
  })
  @Widget('talent-insights')
  async getTalentInsights(input: { employeeId: string }, ctx: ExecutionContext) {
    const employee = this.employeeService.getById(input.employeeId);
    
    if (!employee) {
      return { success: false, message: `Employee not found: ${input.employeeId}` };
    }

    // Mock AI Analysis Logic
    const isEngineering = employee.department === 'Engineering';
    const isManager = employee.role.includes('Manager') || employee.role.includes('VP') || employee.role.includes('Director');
    
    const sentimentScore = 85 + Math.floor(Math.random() * 10);
    const flightRisk = sentimentScore > 90 ? 'Low' : 'Medium';
    
    const skillMetrics = {
      leadership: isManager ? 95 : 60,
      technical: isEngineering ? 95 : 40,
      communication: isManager ? 90 : 75,
      innovation: 85,
      execution: 90
    };

    const growthAreas = isManager ? ['Strategic Planning', 'Cross-functional alignment'] : ['Public Speaking', 'System Design'];
    const topSkills = isEngineering ? ['System Architecture', 'TypeScript', 'Cloud Infra'] : ['Team Motivation', 'Conflict Resolution', 'Hiring'];

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        department: employee.department
      },
      insights: {
        sentimentScore,
        flightRisk,
        skillMetrics,
        growthAreas,
        topSkills,
        aiSummary: `[AI Analysis] ${employee.name} is performing exceptionally well in their role as ${employee.role}. They show strong potential for future leadership opportunities.`
      }
    };
  }
}
