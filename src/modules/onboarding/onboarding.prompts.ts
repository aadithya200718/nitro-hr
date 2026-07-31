import { ControllerDecorator as Controller, PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

/**
 * Onboarding Prompts
 *
 * Reusable MCP prompt templates for guiding LLMs through onboarding workflows.
 */
@Controller()
export class OnboardingPrompts {
  @Prompt({
    name: 'onboarding_checklist',
    description:
      'Generate a step-by-step onboarding checklist for a new hire. Use this prompt to guide an AI assistant through the complete onboarding process.',
    arguments: [
      { name: 'name', description: 'New hire full name', required: true },
      { name: 'role', description: 'Job title or role', required: false },
      { name: 'department', description: 'Department name', required: false },
    ],
  })
  async getOnboardingChecklist(
    args: { name: string; role?: string; department?: string },
    ctx: ExecutionContext
  ) {
    const roleInfo = args.role ? ` (${args.role})` : '';
    const deptInfo = args.department ? ` in the ${args.department} department` : '';

    return {
      messages: [
        {
          role: 'user' as const,
          content: `You are an HR onboarding assistant. Produce a complete, step-by-step onboarding checklist for a new employee named ${args.name}${roleInfo}${deptInfo}.

The checklist should cover the following stages in order:

1. **HRMS Entry** — Use the \`hr_add_employee\` tool to create the employee profile
2. **Welcome Email** — The onboarding tool sends a welcome email automatically
3. **Manager Notification** — The manager receives an automated notification
4. **Equipment Provisioning** — Use the \`hr_create_ticket\` tool to raise tickets for: Laptop, ID Card, and any role-specific equipment
5. **Leave Balance Setup** — Leave balance is initialized automatically (Annual: 20, Sick: 10, Personal: 5)
6. **First-Week Meetings** — Use the \`hr_schedule_meeting\` tool to schedule:
   - Day 1: Introductory meeting with manager
   - Day 2: Team welcome meeting
   - Day 3: IT orientation

Or simply use the \`hr_onboard_employee\` tool to do ALL of the above in a single step.

After presenting the checklist, ask the user if they'd like to proceed with the automated onboarding using the \`hr_onboard_employee\` tool.`,
        },
      ],
    };
  }
}
