import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { demoEmployeesByEmployeeNumber, type DemoEmployeeProfile } from './sampleData';

type DepartmentOption = 'R&D' | 'Support' | 'Account' | 'Hardware';

type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_USER' | 'RESOLVED';

export interface DemoTicket {
  ticketId: string;
  createdAtIso: string;
  createdByEmployeeNumber: string;
  subject: string;
  description: string;
  to: string;
  cc: string[];
  departmentContext: DepartmentOption;
  priority: TicketPriority;
  status: TicketStatus;
}

const demoTicketsByEmployeeNumber: Record<string, DemoTicket[]> = {
  CT1001: [
    {
      ticketId: 'CT-TKT-0007',
      createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      createdByEmployeeNumber: 'CT1001',
      subject: 'Realtime IVRS audio dropout under poor network',
      description:
        'During speech-to-speech calls, audio drops for ~2–3 seconds when network jitter increases. Need improved jitter buffer + reconnect strategy.',
      to: 'AI Team',
      cc: ['Rishi Saini'],
      departmentContext: 'R&D',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    },
  ],
};

function generateTicketId(): string {
  // Simple deterministic-ish ID for demo purposes.
  const n = Math.floor(1000 + Math.random() * 9000);
  return `CT-TKT-${n}`;
}

function inferPriority(text: string): TicketPriority {
  const t = text.toLowerCase();
  if (/(outage|down|sev1|critical|breach|security|p0|urgent)/.test(t)) return 'CRITICAL';
  if (/(fail|failure|error|bug|disconnect|drop|incident)/.test(t)) return 'HIGH';
  if (/(slow|delay|degraded|warning)/.test(t)) return 'MEDIUM';
  return 'LOW';
}

export const internalIvrsAgent = new RealtimeAgent({
  name: 'internalIvrs',
  voice: 'sage',
  handoffDescription:
    'Coral Telecom internal AI IVRS for employee authentication and department workflows (R&D, Support, Account, Hardware).',

  instructions: `
# Role
You are Coral Telecom’s internal AI-based IVRS (Interactive Voice Response System) for employees.

# High-level goals
- Greet professionally.
- Authenticate the caller by employee number.
- Fetch verified employee details.
- Offer department-specific workflows that are role-based and context-aware.

# Conversation rules (voice-first)
- Keep responses short and suitable for speech.
- Ask only one question at a time.
- Confirm critical identifiers (employee number, ticket ID) clearly.
- If the user gives multiple intents, handle the most urgent first.

# Company context
- Company name: Coral Telecom
- Supported departments: R&D, Support, Account, Hardware

# Authentication
- You MUST request employee number first.
- Once the employee number is provided, call lookup_employee_by_number.
- If employee does not exist, ask again and offer an example format like "CT1001".

# After authentication
- Read back: name, position, team, department, manager name, current task.
- Then ask the user to choose a department option: R&D, Support, Account, or Hardware.

# Department flows
## R&D Department
Offer options:
1) Create a new ticket
2) View last raised ticket
3) Check assigned tasks
4) Connect with reporting manager

When creating a ticket:
- Collect: subject, detailed description, intended recipient team or individual, optional CC.
- Then call create_ticket.
- Speak back ticket ID, priority, and routing.

When viewing last ticket:
- Call get_last_ticket and read status.

When checking tasks:
- Call get_assigned_tasks and summarize.

Manager connect:
- Call connect_manager. If busy, offer to record a message using record_manager_message.

## Support Department
Offer options:
- Log customer issue
- Track open support cases
- Escalate critical issue
Use create_ticket with departmentContext="Support" and ensure you categorize the issue (IVRS failure, network disruption, service complaint).

## Account Department
Offer options:
- Billing inquiry
- Invoice status
- Payment confirmation
- Connect manager
For demo, create_ticket routes to "Accounts Team" and uses natural-language confirmations.

## Hardware Department
Offer options:
- Report hardware fault
- Track repair assignment
- Check inventory availability
- Link issue with device serial number
For demo, create_ticket routes to "Hardware Team" and include device serial when provided.

# Safety / scope boundaries
- You are a DEMO internal system. If asked for real ERP/customer data, say you can only demo workflows.
- Do not invent real customer PII.
`,

  tools: [
    tool({
      name: 'lookup_employee_by_number',
      description:
        'Lookup an employee profile by employeeNumber after the caller provides it. Returns verified employee details for the IVRS session.',
      parameters: {
        type: 'object',
        properties: {
          employeeNumber: {
            type: 'string',
            description: 'Employee number like CT1001',
          },
        },
        required: ['employeeNumber'],
        additionalProperties: false,
      },
      execute: async ({ employeeNumber }: { employeeNumber: string }) => {
        const employee = demoEmployeesByEmployeeNumber[employeeNumber];
        if (!employee) {
          return {
            found: false,
          };
        }
        return {
          found: true,
          employee,
        };
      },
    }),

    tool({
      name: 'get_assigned_tasks',
      description:
        'Returns the employee’s currently assigned tasks. Demo returns the currentTask from the employee profile plus a couple of sample tasks.',
      parameters: {
        type: 'object',
        properties: {
          employeeNumber: { type: 'string' },
        },
        required: ['employeeNumber'],
        additionalProperties: false,
      },
      execute: async ({ employeeNumber }: { employeeNumber: string }) => {
        const employee = demoEmployeesByEmployeeNumber[employeeNumber];
        if (!employee) return { success: false, error: 'employee_not_found' };

        return {
          success: true,
          tasks: [
            {
              title: employee.currentTask,
              status: 'IN_PROGRESS',
            },
            {
              title: 'Stability improvements for WebRTC reconnect logic',
              status: 'TODO',
            },
            {
              title: 'Add guardrails for internal IVRS output moderation',
              status: 'TODO',
            },
          ],
        };
      },
    }),

    tool({
      name: 'create_ticket',
      description:
        'Creates a ticket for internal workflows. Auto-generates a ticket ID and assigns priority based on content analysis (demo).',
      parameters: {
        type: 'object',
        properties: {
          employeeNumber: { type: 'string' },
          departmentContext: {
            type: 'string',
            enum: ['R&D', 'Support', 'Account', 'Hardware'],
            description: 'Department flow context for routing.',
          },
          subject: { type: 'string' },
          description: { type: 'string' },
          to: {
            type: 'string',
            description: 'Intended recipient team or person.',
          },
          cc: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional CC list (names or teams).',
          },
        },
        required: ['employeeNumber', 'departmentContext', 'subject', 'description', 'to'],
        additionalProperties: false,
      },
      execute: async (
        args: {
          employeeNumber: string;
          departmentContext: DepartmentOption;
          subject: string;
          description: string;
          to: string;
          cc?: string[];
        },
      ) => {
        const employee = demoEmployeesByEmployeeNumber[args.employeeNumber];
        if (!employee) return { success: false, error: 'employee_not_found' };

        const ticketId = generateTicketId();
        const priority = inferPriority(`${args.subject} ${args.description}`);

        const ticket: DemoTicket = {
          ticketId,
          createdAtIso: new Date().toISOString(),
          createdByEmployeeNumber: args.employeeNumber,
          subject: args.subject,
          description: args.description,
          to: args.to,
          cc: args.cc ?? [],
          departmentContext: args.departmentContext,
          priority,
          status: 'OPEN',
        };

        demoTicketsByEmployeeNumber[args.employeeNumber] ??= [];
        demoTicketsByEmployeeNumber[args.employeeNumber].unshift(ticket);

        return {
          success: true,
          ticket,
          routedTo: args.to,
        };
      },
    }),

    tool({
      name: 'get_last_ticket',
      description: 'Fetch the most recently created ticket for an employee (demo).',
      parameters: {
        type: 'object',
        properties: {
          employeeNumber: { type: 'string' },
        },
        required: ['employeeNumber'],
        additionalProperties: false,
      },
      execute: async ({ employeeNumber }: { employeeNumber: string }) => {
        const list = demoTicketsByEmployeeNumber[employeeNumber] ?? [];
        if (list.length === 0) {
          return { success: true, ticket: null };
        }
        return { success: true, ticket: list[0] };
      },
    }),

    tool({
      name: 'connect_manager',
      description:
        'Checks manager availability and if available, connects the call. Demo randomly marks manager as available/busy.',
      parameters: {
        type: 'object',
        properties: {
          employeeNumber: { type: 'string' },
        },
        required: ['employeeNumber'],
        additionalProperties: false,
      },
      execute: async ({ employeeNumber }: { employeeNumber: string }) => {
        const employee: DemoEmployeeProfile | undefined = demoEmployeesByEmployeeNumber[employeeNumber];
        if (!employee) return { success: false, error: 'employee_not_found' };

        const available = Math.random() > 0.5;
        return {
          success: true,
          manager: employee.manager,
          available,
          nextAction: available ? 'CONNECTING_CALL' : 'RECORD_MESSAGE',
        };
      },
    }),

    tool({
      name: 'record_manager_message',
      description:
        'Records a short voice message for the manager when they are busy. Demo stores nothing but returns a confirmation.',
      parameters: {
        type: 'object',
        properties: {
          employeeNumber: { type: 'string' },
          message: { type: 'string', description: 'Message content captured via STT.' },
        },
        required: ['employeeNumber', 'message'],
        additionalProperties: false,
      },
      execute: async ({ employeeNumber, message }: { employeeNumber: string; message: string }) => {
        const employee = demoEmployeesByEmployeeNumber[employeeNumber];
        if (!employee) return { success: false, error: 'employee_not_found' };

        return {
          success: true,
          deliveredTo: employee.manager.name,
          summary: message.slice(0, 140),
        };
      },
    }),
  ],
});
