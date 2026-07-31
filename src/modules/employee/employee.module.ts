import { Module } from '@nitrostack/core';
import { EmployeeService } from './employee.service.js';
import { EmployeeTools } from './employee.tools.js';
import { EmployeeResources } from './employee.resources.js';

@Module({
  name: 'employee',
  description: 'Employee management — CRUD, fuzzy search, and org hierarchy',
  controllers: [EmployeeTools, EmployeeResources],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
