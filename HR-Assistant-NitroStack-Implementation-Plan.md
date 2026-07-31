# 🤖 HR Assistant MCP Server — NitroStack Implementation Plan

> An intelligent, MCP-powered HR management system that automates employee onboarding, leave management, meeting scheduling, and IT ticketing through conversational AI — built on the **NitroStack** TypeScript MCP framework.

## 📖 Overview

The HR Assistant is an MCP server built with **NitroStack** (decorator-based, NestJS-style architecture) that exposes HR operations as MCP tools, resources, and prompts. It replaces manual, fragmented HR admin work with a single conversational interface that any MCP-compatible client (Claude Desktop, NitroStudio, etc.) can drive.

This document is the implementation plan for porting/rebuilding the existing Python/FastMCP HR Assistant onto NitroStack, keeping every existing capability while adopting NitroStack's module system, dependency injection, guards, caching, and widget layer.

## 🎯 Goals

- Preserve all existing functionality (employee management, leave management, meeting scheduling, IT ticketing, email automation, one-shot onboarding).
- Move from a single-file `server.py` + manager classes to a modular NitroStack project (modules, tools, resources, prompts, services).
- Add typed, Zod-validated inputs/outputs for every tool.
- Add read-only **resources** for data the assistant currently only exposes via tool calls (employee profiles, org chart, ticket status).
- Add **prompt templates** for the multi-step onboarding workflow so it's reusable and consistent.
- Add auth (API key to start, OAuth 2.1-ready) and basic guards instead of an open server.
- Add optional **widgets** so onboarding summaries, org charts, and ticket boards render visually in NitroStudio / widget-capable clients.

## 🧩 Key Features (unchanged from current system)

- **🧑‍💼 Employee Management** — add employees, retrieve details, fuzzy search by name, manage reporting hierarchy
- **📅 Leave Management** — track leave balances, process applications, maintain leave history
- **🗓️ Meeting Scheduler** — schedule, view, and cancel meetings with conflict detection
- **🎫 IT Ticketing** — create and track equipment requests (laptops, monitors, accessories, ID cards)
- **📧 Email Automation** — automated notifications for onboarding, approvals, and updates
- **🚀 Smart Onboarding** — full employee onboarding orchestrated from a single prompt/tool call

## 🏗️ Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Client (Claude / NitroStudio)         │
└────────────────────────┬──────────────────────────────────┘
                          │ MCP Protocol (stdio / HTTP+SSE)
┌────────────────────────▼──────────────────────────────────┐
│                 NitroStack MCP Application                  │
│                (McpApplicationFactory + AppModule)           │
│                                                              │
│  Tools Layer          Resources Layer        Prompts Layer   │
│  • employee.tools     • employee.resources    • onboarding    │
│  • leave.tools         • org-chart.resources    .prompts      │
│  • meeting.tools       • ticket.resources                     │
│  • ticket.tools                                                │
│  • email.tools (internal, called by other tools)               │
└────────────────────────┬──────────────────────────────────┘
                          │ Dependency Injection
        ┌─────────────────┼─────────────────┬───────────────┐
        │                 │                 │               │
┌───────▼──────┐ ┌────────▼───────┐ ┌───────▼──────┐ ┌──────▼──────┐
│ EmployeeService│ │  LeaveService  │ │MeetingService│ │TicketService│
└───────┬──────┘ └────────┬───────┘ └───────┬──────┘ └──────┬──────┘
        │                 │                 │               │
        └────────────────────┬───────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   EmailService     │
                    │  (SMTP / Gmail)    │
                    └────────────────────┘
```

### Why this maps cleanly to NitroStack

- Each existing "Manager" class (`EmployeeManager`, `LeaveManager`, `MeetingManager`, `TicketManager`) becomes an `@Injectable()` **service**, injected via constructor DI into the corresponding `*.tools.ts` / `*.resources.ts` classes — same separation of concerns, just NitroStack's DI instead of manual instantiation.
- `emails.py` becomes an `@Injectable() EmailService`, injected wherever a tool needs to notify someone (onboarding, ticket updates, leave approvals).
- `utils.py`'s seeded data becomes a `SeedService` run once at bootstrap (or an in-memory repository per service, matching the current mock-database approach).
- `schemas.py` (Pydantic) becomes Zod schemas (`z.object({...})`) inline in each `@Tool`/`@Resource`/`@Prompt` decorator, giving the same validation guarantees NitroStack expects end-to-end.

## 📁 Project Structure

```
hr-assistant-mcp/
├── src/
│   ├── index.ts                        # Entry point (McpApplicationFactory.create)
│   ├── app.module.ts                   # Root module — imports all feature modules
│   │
│   ├── modules/
│   │   ├── employee/
│   │   │   ├── employee.module.ts
│   │   │   ├── employee.service.ts     # CRUD + fuzzy search + org hierarchy
│   │   │   ├── employee.tools.ts       # add_employee, get_employee, search_employee_by_name
│   │   │   ├── employee.resources.ts   # employee://{id}, org://chart
│   │   │   └── employee.schemas.ts     # Zod schemas + shared TS types
│   │   │
│   │   ├── leave/
│   │   │   ├── leave.module.ts
│   │   │   ├── leave.service.ts        # balance + history + apply/approve
│   │   │   ├── leave.tools.ts          # apply_leave, get_leave_balance, get_leave_history
│   │   │   └── leave.resources.ts      # leave://{employeeId}
│   │   │
│   │   ├── meeting/
│   │   │   ├── meeting.module.ts
│   │   │   ├── meeting.service.ts      # scheduling + conflict detection
│   │   │   ├── meeting.tools.ts        # schedule_meeting, cancel_meeting, get_meetings
│   │   │   └── meeting.resources.ts    # meetings://{employeeId}
│   │   │
│   │   ├── ticket/
│   │   │   ├── ticket.module.ts
│   │   │   ├── ticket.service.ts       # ticket lifecycle
│   │   │   ├── ticket.tools.ts         # create_ticket, update_ticket, get_tickets
│   │   │   └── ticket.resources.ts     # ticket://{ticketId}
│   │   │
│   │   ├── email/
│   │   │   ├── email.module.ts
│   │   │   └── email.service.ts        # SMTP wrapper (nodemailer)
│   │   │
│   │   └── onboarding/
│   │       ├── onboarding.module.ts
│   │       ├── onboarding.tools.ts     # onboard_employee (single orchestrating tool)
│   │       └── onboarding.prompts.ts   # onboarding_checklist prompt template
│   │
│   ├── common/
│   │   ├── guards/
│   │   │   └── api-key.guard.ts        # protects write operations
│   │   ├── pipes/
│   │   │   └── trim.pipe.ts            # optional input-normalization pipe
│   │   └── utils/
│   │       └── uri.ts                  # resource URI parsing helper
│   │
│   └── widgets/                        # Next.js widget components (optional visuals)
│       └── app/
│           ├── onboarding-summary/page.tsx
│           ├── org-chart/page.tsx
│           └── ticket-board/page.tsx
│
├── .env                                 # SENDER_EMAIL, SENDER_EMAIL_PWD, API_KEY
├── package.json
├── tsconfig.json
└── nitrostack.config.ts                 # (generated by CLI init)
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| MCP framework | **NitroStack** (`@nitrostack/core`) |
| CLI / scaffolding | `@nitrostack/cli` |
| Validation | Zod (built into NitroStack decorators) |
| Testing / debugging | NitroStudio |
| Email | `nodemailer` (SMTP/Gmail, TLS) wrapped in `EmailService` |
| Widgets (optional) | `@nitrostack/widgets` + Next.js |
| Runtime | Node.js 20.18.1 (via nvm), npm 9+, `tsx` |

## 🚀 Implementation Steps

### Step 1 — Scaffold the project

```bash
npx @nitrostack/cli init hr-assistant-mcp
cd hr-assistant-mcp
npm run dev
```

Optionally open the folder in **NitroStudio** for live tool testing, AI chat, and widget preview while building.

### Step 2 — Define the root module

```typescript
// src/app.module.ts
import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { EmployeeModule } from './modules/employee/employee.module.js';
import { LeaveModule } from './modules/leave/leave.module.js';
import { MeetingModule } from './modules/meeting/meeting.module.js';
import { TicketModule } from './modules/ticket/ticket.module.js';
import { EmailModule } from './modules/email/email.module.js';
import { OnboardingModule } from './modules/onboarding/onboarding.module.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'hr-assistant-server',
    version: '1.0.0'
  }
})
@Module({
  imports: [
    ConfigModule.forRoot(),
    EmployeeModule,
    LeaveModule,
    MeetingModule,
    TicketModule,
    EmailModule,
    OnboardingModule
  ]
})
export class AppModule {}
```

### Step 3 — Employee module (service + tools + resource)

```typescript
// src/modules/employee/employee.service.ts
import { Injectable } from '@nitrostack/core';

@Injectable()
export class EmployeeService {
  private employees = new Map<string, Employee>();
  private nextId = 1;

  add(data: NewEmployee): Employee {
    const id = `E${String(this.nextId++).padStart(3, '0')}`;
    const employee = { id, ...data };
    this.employees.set(id, employee);
    return employee;
  }

  getById(id: string): Employee | undefined {
    return this.employees.get(id);
  }

  searchByName(name: string): Employee[] {
    // fuzzy match, mirroring the difflib-based search in the current system
  }
}
```

```typescript
// src/modules/employee/employee.tools.ts
import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { UseGuards } from '@nitrostack/core';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';
import { EmployeeService } from './employee.service.js';

export class EmployeeTools {
  constructor(private employeeService: EmployeeService) {}

  @Tool({
    name: 'add_employee',
    description: 'Add a new employee to the HR system',
    inputSchema: z.object({
      name: z.string().describe('Full name'),
      email: z.string().email(),
      managerId: z.string().optional().describe('Reporting manager employee ID')
    })
  })
  @UseGuards(ApiKeyGuard)
  async addEmployee(input: any, ctx: ExecutionContext) {
    return this.employeeService.add(input);
  }

  @Tool({
    name: 'search_employee_by_name',
    description: 'Fuzzy-search employees by name',
    inputSchema: z.object({ name: z.string() })
  })
  async searchEmployee(input: { name: string }) {
    return this.employeeService.searchByName(input.name);
  }
}
```

```typescript
// src/modules/employee/employee.resources.ts
import { ResourceDecorator as Resource } from '@nitrostack/core';
import { EmployeeService } from './employee.service.js';

export class EmployeeResources {
  constructor(private employeeService: EmployeeService) {}

  @Resource({
    uri: 'employee://{id}',
    name: 'Employee Profile',
    description: 'Employee details including role and manager',
    mimeType: 'application/json'
  })
  async getEmployee(uri: string) {
    const id = uri.replace('employee://', '');
    const employee = this.employeeService.getById(id);
    if (!employee) throw new Error(`Employee not found: ${id}`);
    return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(employee, null, 2) }] };
  }
}
```

Apply the same **service → tools → resource** pattern for `leave`, `meeting`, and `ticket` modules, matching the current feature set:

- **Leave**: `apply_leave`, `get_leave_balance`, `get_leave_history` tools; `leave://{employeeId}` resource.
- **Meeting**: `schedule_meeting`, `cancel_meeting`, `get_meetings` tools with conflict detection (port the existing `ValueError: Conflict` check into a thrown `Error` in the service).
- **Ticket**: `create_ticket`, `update_ticket`, `get_tickets` tools; `ticket://{ticketId}` resource; keep the `T0001` ID format in `TicketService`.

### Step 4 — Email service

```typescript
// src/modules/email/email.service.ts
import { Injectable } from '@nitrostack/core';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_EMAIL_PWD
    }
  });

  async send(to: string, subject: string, html: string) {
    await this.transporter.sendMail({ from: process.env.SENDER_EMAIL, to, subject, html });
  }
}
```

`EmailService` is injected into `OnboardingTools`, `TicketTools`, and `LeaveTools` wherever a notification needs to go out — no tool talks to SMTP directly.

### Step 5 — Onboarding orchestration (tool + prompt)

The one-shot onboarding flow becomes a single orchestrating tool that calls the other services via DI, plus a companion prompt template that produces a consistent checklist.

```typescript
// src/modules/onboarding/onboarding.tools.ts
@Tool({
  name: 'onboard_employee',
  description: 'Fully onboard a new employee: add record, send welcome email, notify manager, raise equipment tickets, schedule intro meeting',
  inputSchema: z.object({
    name: z.string(),
    email: z.string().email(),
    managerId: z.string(),
    equipment: z.array(z.enum(['Laptop', 'Monitor', 'ID Card', 'Office Supplies'])).default(['Laptop', 'ID Card'])
  })
})
@UseGuards(ApiKeyGuard)
async onboardEmployee(input: OnboardInput, ctx: ExecutionContext) {
  const employee = this.employeeService.add(input);
  await this.emailService.send(employee.email, 'Welcome!', this.templates.welcome(employee));
  const manager = this.employeeService.getById(input.managerId);
  if (manager) await this.emailService.send(manager.email, 'New report onboarded', this.templates.managerNotice(employee));

  const tickets = input.equipment.map(item => this.ticketService.create({ employeeId: employee.id, item }));
  const meeting = this.meetingService.schedule({ employeeId: employee.id, topic: 'Introductory Meeting', datetime: this.nextAvailableSlot() });

  return { employee, tickets, meeting };
}
```

```typescript
// src/modules/onboarding/onboarding.prompts.ts
@Prompt({
  name: 'onboarding_checklist',
  description: 'Generate a step-by-step onboarding checklist for a new hire',
  arguments: [
    { name: 'name', description: 'New hire name', required: true },
    { name: 'role', description: 'Job title', required: false }
  ]
})
async getOnboardingChecklist(args: { name: string; role?: string }) {
  return [{
    role: 'user' as const,
    content: `Produce an onboarding checklist for ${args.name}${args.role ? ` (${args.role})` : ''} covering: HRMS entry, welcome email, manager notification, equipment provisioning, and first-week meetings.`
  }];
}
```

### Step 6 — Auth

Start with API-key auth (matches the current "no auth" system but closes the obvious gap before any real deployment); leave OAuth 2.1 as a documented upgrade path.

```typescript
// src/common/guards/api-key.guard.ts
import { CanActivate, ExecutionContext } from '@nitrostack/core';

export class ApiKeyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    return ctx.request?.headers?.['x-api-key'] === process.env.MCP_API_KEY;
  }
}
```

Apply `@UseGuards(ApiKeyGuard)` to every **write** tool (`add_employee`, `apply_leave`, `schedule_meeting`, `create_ticket`, `onboard_employee`); leave read-only tools/resources open or behind a lighter guard, matching least-privilege.

### Step 7 — Optional widgets

Add visual output for the highest-value moments, reusing NitroStack's `@Widget()` decorator:

- `@Widget('onboarding-summary')` on `onboard_employee` — shows the new hire card, tickets, and meeting time.
- `@Widget('org-chart')` on the org-chart resource — renders the reporting tree.
- `@Widget('ticket-board')` on `get_tickets` — kanban-style ticket status view.

### Step 8 — Seed data

Port the existing mock dataset (8 employees, org hierarchy, random leave balances, sample meetings/tickets) into a `SeedService` that runs once during `bootstrap()`, so local development and NitroStudio testing behave exactly like the current Python version.

### Step 9 — Testing & deployment

- Use NitroStudio's real-time tool testing and AI chat to validate each tool/resource/prompt before wiring guards.
- Follow NitroStack's production checklist (env vars, Docker, or serverless) to deploy — Docker is the most direct analogue to the current standalone `python server.py` deployment.

## ⚙️ Configuration Reference

### Environment variables (`.env`)

```env
SENDER_EMAIL=your-email@gmail.com
SENDER_EMAIL_PWD=your-app-password
MCP_API_KEY=choose-a-strong-key
```

### Claude Desktop MCP config

```json
{
  "mcpServers": {
    "hr-assistant": {
      "command": "node",
      "args": ["/absolute/path/to/hr-assistant-mcp/dist/index.js"],
      "env": {
        "SENDER_EMAIL": "your-email@gmail.com",
        "SENDER_EMAIL_PWD": "your-app-password",
        "MCP_API_KEY": "choose-a-strong-key"
      }
    }
  }
}
```

## 💡 Usage Examples (unchanged behavior, new backend)

```
You: Onboard a new employee named Alex Thompson, email alex.thompson@bluparrot.in, reporting to Sarah Johnson (E001)

Claude → onboard_employee tool call:
  ✅ Alex Thompson (E009) added
  ✅ Welcome email sent
  ✅ Manager Sarah Johnson notified
  ✅ Tickets created: Laptop, ID Card
  ✅ Meeting scheduled for tomorrow at 10 AM
```

```
You: What's Tony Sharma's leave balance?
Claude → get_leave_balance("E004") → "Tony Sharma (E004) has 12 leave days remaining."
```

```
You: Schedule a team sync for David Wilson on Jan 20, 2026 at 2 PM
Claude → schedule_meeting → "Meeting scheduled for E003 on 2026-01-20T14:00:00 about 'Team Sync'."
```

## 🔒 Security Considerations

1. Credentials only in `.env` — never hardcoded.
2. TLS for all SMTP traffic (unchanged from current setup).
3. Zod validation on every tool/resource/prompt input (stronger than the current Pydantic layer since it's enforced at the decorator level by NitroStack).
4. `ApiKeyGuard` on all write operations; OAuth 2.1 available as a drop-in upgrade via `@nitrostack/core` auth module.
5. Error messages stay descriptive but avoid leaking internals (mirrors current `ValueError`-style handling, now via NitroStack's error-handling guide).

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| MCP server not connecting in Claude Desktop | Verify absolute path in `claude_desktop_config.json`, restart Claude Desktop, confirm `npm run build` succeeded |
| Employee not found | Use `search_employee_by_name` for fuzzy matching; verify seeded ID format (`E001`, `E002`, ...) |
| Meeting conflict error | Check `get_meetings` first, pick a different slot, or cancel the conflicting meeting |
| Email not sending | Confirm Gmail App Password (not main password) and that 2FA is enabled |
| Module not found / ESM errors | Ensure all relative imports use the `.js` extension |

## 🗺️ Feature Parity Checklist

- [ ] Employee: add, get, fuzzy search, org hierarchy resource
- [ ] Leave: apply, balance, history
- [ ] Meeting: schedule, cancel, list, conflict detection
- [ ] Ticket: create, update, list, `T0001`-style IDs
- [ ] Email: welcome, manager notification, ticket/leave notifications
- [ ] Onboarding: single-tool orchestration + checklist prompt
- [ ] API-key guard on all write tools
- [ ] Seed data matching current 8-employee org chart
- [ ] (Optional) Widgets for onboarding summary, org chart, ticket board

---

*This plan intentionally omits contribution guidelines, external roadmap, and author/licensing sections — it's scoped purely to the technical implementation on NitroStack. Paste your own draft/plan details in wherever you want to adjust scope, and I'll fold them into the module breakdown above.*
