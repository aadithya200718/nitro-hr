import { Injectable } from '@nitrostack/core';
import { Employee } from './employee.schemas.js';
import { fuzzySearchByName } from '../../common/utils/fuzzy.js';

/**
 * Employee Service
 *
 * Core business logic for employee CRUD operations,
 * fuzzy search, and organizational hierarchy management.
 * Uses an in-memory Map as the data store.
 */
@Injectable()
export class EmployeeService {
  private employees = new Map<string, Employee>();
  private nextId = 1;

  /**
   * Add a new employee to the system.
   */
  add(data: {
    name: string;
    email: string;
    department: string;
    role: string;
    managerId?: string;
  }): Employee {
    const id = `E${String(this.nextId++).padStart(3, '0')}`;
    const employee: Employee = {
      id,
      name: data.name,
      email: data.email,
      department: data.department,
      role: data.role,
      managerId: data.managerId,
      joinDate: new Date().toISOString().split('T')[0],
    };
    this.employees.set(id, employee);
    return employee;
  }

  /**
   * Retrieve an employee by their ID.
   */
  getById(id: string): Employee | undefined {
    return this.employees.get(id.toUpperCase());
  }

  /**
   * Get all employees.
   */
  getAll(): Employee[] {
    return Array.from(this.employees.values());
  }

  /**
   * Fuzzy-search employees by name.
   */
  searchByName(name: string): Employee[] {
    const allEmployees = this.getAll();
    return fuzzySearchByName(allEmployees, name);
  }

  /**
   * Get direct reports for a manager.
   */
  getDirectReports(managerId: string): Employee[] {
    return this.getAll().filter((e) => e.managerId === managerId);
  }

  /**
   * Build the full organizational chart as a hierarchical structure.
   */
  getOrgChart(): object {
    const allEmployees = this.getAll();

    // Find root employees (no manager)
    const roots = allEmployees.filter((e) => !e.managerId);

    const buildTree = (employee: Employee): object => {
      const reports = allEmployees.filter((e) => e.managerId === employee.id);
      return {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        department: employee.department,
        directReports: reports.map((r) => buildTree(r)),
      };
    };

    return roots.map((root) => buildTree(root));
  }

  /**
   * Set the next ID counter (used by SeedService to avoid ID conflicts).
   */
  setNextId(id: number): void {
    this.nextId = id;
  }
}
