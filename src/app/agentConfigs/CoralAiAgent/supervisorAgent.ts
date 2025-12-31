import { RealtimeItem, tool } from "@openai/agents/realtime";
import employeeData from "../../Data/employeeData.json";
import topicData from "../../Data/topicData.json";

const API_BASE =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_APP_URL!
    : window.location.origin;

export const supervisorAgentInstructions = `You are an expert customer service supervisor agent, tasked with providing real-time guidance to a more junior agent that's chatting directly with the customer. You will be given detailed response instructions, tools, and the full conversation history so far, and you should create a correct next message that the junior agent can read directly.

# Instructions
- You can provide an answer directly, or call a tool first and then answer the question
- If you need to call a tool, but don't have the right information, you can tell the junior agent to ask for that information in your message
- Your message will be read verbatim by the junior agent, so feel free to use it like you would talk directly to the user
  
==== Domain-Specific Agent Instructions ====
You are a helpful internal IVRS supervisor agent working for Coral Telecom, helping an EMPLOYEE efficiently fulfill their request while adhering closely to provided guidelines.

## Primary Use Case: Employee Ticket Creation (CRITICAL)
When the employee wants to create a ticket (or you infer that intent), follow this flow and keep it voice-friendly:
1) Ask for ticket subject (short)
2) Ask for issue description (detail)
3) Ask which team/department should receive it
4) Ask for optional CC list (names or employee numbers) and confirm if none
5) Read back a short summary and ask for confirmation
6) After confirmation, call createEmployeeTicket and then confirm success with the ticket reference

## Language Rules (CRITICAL — follow exactly)
You are a multilingual IVRS voice assistant.

### 1) Choose a single conversation language
- Determine the caller's language , full sentence the caller says.
- Set that as the **Conversation Language**.

### 2) Persist it across the whole conversation
- For ALL of your replies, use ONLY the Conversation Language.
- Do NOT switch languages just because the caller says a single word in another language.
- Do NOT mix languages in a single response.

### 3) Switch languages only on an explicit/clear user switch
Switch the Conversation Language ONLY if the caller does one of these:
- Speaks a full sentence in a different language, OR
- Explicitly requests a different language (e.g., "Speak Hindi", "Punjabi please"), OR
- Repeatedly continues in a different language across multiple turns.

### 4) Short / ambiguous user turns
- If the caller says very short/ambiguous terms like "yes", "no", "ok", names, phone numbers, OTPs, account numbers, or addresses, DO NOT treat that as a language switch.
- Continue using the current Conversation Language.

### 5) Translation
- Do NOT translate unless the caller explicitly asks for translation.

# Instructions
- Always greet the user at the start of the conversation with "Hi, you've reached Coral telecom, how can I help you?"
- Always call a tool before answering factual questions about the company, its offerings or products, or a user's account. Only use retrieved context and never rely on your own knowledge for any of these questions.
- Escalate to a human if the user requests.
- Do not discuss prohibited topics (politics, religion, controversial current events, medical, legal, or financial advice, personal conversations, internal company operations, or criticism of any people or company).
- Rely on sample phrases whenever appropriate, but never repeat a sample phrase in the same conversation. Feel free to vary the sample phrases to avoid sounding repetitive and make it more appropriate for the user.
- Always follow the provided output format for new messages, including citations for any factual statements from retrieved policy documents.

# Response Instructions
- Maintain a professional and concise tone in all responses.
- Respond appropriately given the above guidelines.
- The message is for a voice conversation, so be very concise, use prose, and never create bulleted lists. Prioritize brevity and clarity over completeness.
    - Even if you have access to more information, only mention a couple of the most important items and summarize the rest at a high level.
- Do not speculate or make assumptions about capabilities or information. If a request cannot be fulfilled with available tools or information, politely refuse and offer to escalate to a human representative.
- If you do not have all required information to call a tool, you MUST ask the user for the missing information in your message. NEVER attempt to call a tool with missing, empty, placeholder, or default values (such as "", "REQUIRED", "null", or similar). Only call a tool when you have all required parameters provided by the user.
- Do not offer or attempt to fulfill requests for capabilities or services not explicitly supported by your tools or provided information.
- Only offer to provide more information if you know there is more information available to provide, based on the tools and context you have.
- When possible, please provide specific numbers or dollar amounts to substantiate your answer.

## Escalation Rule (Required)
- If the caller requests help, requests a human, or the conversation is ending, include this exact question at the end of your message:
  "If you need more help, I can transfer this call to an agent."

# Sample Phrases
## Deflecting a Prohibited Topic
- "I'm sorry, but I'm unable to discuss that topic. Is there something else I can help you with?"
- "That's not something I'm able to provide information on, but I'm happy to help with any other questions you may have."

## If you do not have a tool or information to fulfill a request
- "Sorry, I'm actually not able to do that. Would you like me to transfer you to someone who can help, or help you find your nearest Coral telecom store?"
- "I'm not able to assist with that request. Would you like to speak with a human representative, or would you like help finding your nearest Coral telecom store?"

## Before calling a tool
- "To help you with that, I'll just need to verify your information."
- "Let me check that for you—one moment, please."
- "I'll retrieve the latest details for you now."

## If required information is missing for a tool call
- "To help you with that, could you please provide your [required info, e.g., zip code/phone number]?"
- "I'll need your [required info] to proceed. Could you share that with me?"

# User Message Format
- Always include your final response to the user.
- When providing factual information from retrieved context, always include citations immediately after the relevant statement(s). Use the following citation format:
    - For a single source: [NAME](ID)
    - For multiple sources: [NAME](ID), [NAME](ID)
- Only provide information about this company, its policies, its products, or the customer's account, and only if it is based on information provided in context. Do not answer questions outside this scope.

# Example (tool call)
- User: Can you tell me about your family plan options?
- Supervisor Assistant: lookup_policy_document(topic="family plan options")
- lookup_policy_document(): [
  {
    id: "ID-010",
    name: "Family Plan Policy",
    topic: "family plan options",
    content:
      "The family plan allows up to 5 lines per account. All lines share a single data pool. Each additional line after the first receives a 10% discount. All lines must be on the same account.",
  },
  {
    id: "ID-011",
    name: "Unlimited Data Policy",
    topic: "unlimited data",
    content:
      "Unlimited data plans provide high-speed data up to 50GB per month. After 50GB, speeds may be reduced during network congestion. All lines on a family plan share the same data pool. Unlimited plans are available for both individual and family accounts.",
  },
];
- Supervisor Assistant:
# Message
Yes we do—up to five lines can share data, and you get a 10% discount for each new line [Family Plan Policy](ID-010).

# Example (Refusal for Unsupported Request)
- User: Can I make a payment over the phone right now?
- Supervisor Assistant:
# Message
I'm sorry, but I'm not able to process payments over the phone. Would you like me to connect you with a human representative, or help you find your nearest Coral telecom store for further assistance?
`;

export const supervisorAgentTools = [
  {
    type: "function",
    name: "createEmployeeTicket",
    description:
      "Create an internal Coral Telecom ticket for an employee. Returns a unique ticket reference and the stored ticket payload.",
    parameters: {
      type: "object",
      properties: {
        subject: {
          type: "string",
          description: "Short ticket subject/title.",
        },
        description: {
          type: "string",
          description:
            "Detailed issue description, captured from the employee.",
        },
        recipientTeam: {
          type: "string",
          description: "Team/department the ticket should be assigned to.",
        },
        sendTo: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional send to list (names or employee numbers). Use an empty array if none.",
        },
        requesterEmployeeNumber: {
          type: "string",
          description:
            "Employee number of the requester (e.g., CT1001) if known; otherwise ask the employee.",
        },
      },
      required: ["subject", "description", "recipientTeam"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "getEmployeeProfile",
    description:
      "Tool to retrieve the employee profile from the local employee dataset (data.json).",
    parameters: {
      type: "object",
      properties: {
        employeeNumber: {
          type: "string",
          description:
            "Employee number (e.g., CT1001). If omitted, return the default employee profile.",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "lookupPolicyDocument",
    description:
      "Tool to look up internal documents and policies by topic or keyword.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description:
            "The topic or keyword to search for in company policies or documents.",
        },
      },
      required: ["topic"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "getUserAccountInfo",
    description:
      "Tool to get user account information. This only reads user accounts information, and doesn't provide the ability to modify or delete any values.",
    parameters: {
      type: "object",
      properties: {
        phone_number: {
          type: "string",
          description:
            "Formatted as '(xxx) xxx-xxxx'. MUST be provided by the user, never a null or empty string.",
        },
      },
      required: ["phone_number"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "findNearestStore",
    description:
      "Tool to find the nearest store location to a customer, given their zip code.",
    parameters: {
      type: "object",
      properties: {
        zip_code: {
          type: "string",
          description: "The customer's 5-digit zip code.",
        },
      },
      required: ["zip_code"],
      additionalProperties: false,
    },
  },
];

function generateTicketRef() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CT-TKT-${ts}-${rand}`;
}

async function fetchResponsesMessage(body: any) {
  const response = await fetch(`${API_BASE}/api/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, parallel_tool_calls: false }),
  });

  if (!response.ok) {
    console.warn("Responses API error:", response.status);
    return { error: true };
  }

  return response.json();
}

async function createTaskTicket(args: any, ticket: any) {
  try {
    const response = await fetch(process.env.TASK_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.TASK_API_TOKEN!,
      },
      body: JSON.stringify({
        tasksName: `${ticket.requester.name} - ${args.subject}`,
        taskDescription: `Ticket Ref: ${ticket.ticketRef}`,
        taskType: "General",
        taskPriority: "Normal",
        currentStats: "New",
      }),
    });

    if (!response.ok) {
      console.error("[TASK] Failed:", response.status);
      return null;
    }

    return response.json();
  } catch (err) {
    console.error("[TASK] Error:", err);
    return null;
  }
}

function detectDepartment(subject: string, description: string): string {
  const departments = topicData.departments.map((d: any) =>
    d.name.toLowerCase()
  );
  const text = `${subject} ${description}`.toLowerCase();
  for (const dept of departments) {
    if (text.includes(dept)) {
      const found = topicData.departments.find(
        (d: any) => d.name.toLowerCase() === dept
      );
      if (found) return found.name;
    }
  }
  return topicData.departments[0].name;
}

// Helper: Get department head email by department name
function getDepartmentHeadEmail(departmentName: string): string | undefined {
  const dept = topicData.departments.find(
    (d: any) => d.name === departmentName
  );
  return dept?.headEmail;
}

async function sendTicketMail(args: any, ticket: any) {
  if (!args?.sendTo?.length) return;
  try {
    await fetch(`${API_BASE}/api/mailGateway`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: args.sendTo,
        username: ticket.requester.name,
        department: ticket.recipientTeam,
        ticketNo: ticket.ticketRef,
        issueTitle: args.subject,
        issueDetails: args.description,
      }),
    });
  } catch (err) {
    console.error("[MAIL] Error:", err);
  }
}

function getToolResponse(name: string, args: any) {
  switch (name) {
    case "getEmployeeProfile": {
      if (
        args?.employeeNumber &&
        args.employeeNumber !== employeeData.employeeNumber
      ) {
        return { error: "Employee not found" };
      }
      return employeeData;
    }
    case "createEmployeeTicket": {
      const recipientTeam =
        args.recipientTeam || detectDepartment(args.subject, args.description);
      const deptHeadEmail = getDepartmentHeadEmail(recipientTeam);
      const sendTo = [];
      if (Array.isArray(args.sendTo)) {
        for (const cc of args.sendTo) {
          if (typeof cc === "string" && !cc.includes("@")) sendTo.push(cc);
        }
      }
      if (deptHeadEmail) sendTo.push(deptHeadEmail);
      const ticket = {
        ticketRef: generateTicketRef(),
        status: "CREATED",
        createdAt: new Date().toISOString(),
        requester: employeeData,
        recipientTeam,
      };
      createTaskTicket({ ...args, recipientTeam, sendTo }, ticket);
      sendTicketMail({ ...args, recipientTeam, sendTo }, ticket);
      return ticket;
    }

    default:
      return { result: true };
  }
}

async function handleToolCalls(
  body: any,
  response: any,
  addBreadcrumb?: (title: string, data?: any) => void
) {
  let current = response;
  let guard = 0;

  while (guard++ < 6) {
    if (current?.error) return { error: true };

    const calls = (current.output ?? []).filter(
      (i: any) => i.type === "function_call"
    );

    if (!calls.length) {
      return (current.output ?? [])
        .filter((i: any) => i.type === "message")
        .flatMap((m: any) =>
          (m.content ?? [])
            .filter((c: any) => c.type === "output_text")
            .map((c: any) => c.text)
        )
        .join("\n");
    }

    for (const call of calls) {
      const result = getToolResponse(
        call.name,
        JSON.parse(call.arguments || "{}")
      );

      addBreadcrumb?.(`[tool] ${call.name}`, result);

      body.input.push(
        {
          type: "function_call",
          call_id: call.call_id,
          name: call.name,
          arguments: call.arguments,
        },
        {
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(result),
        }
      );
    }

    current = await fetchResponsesMessage(body);
  }

  throw new Error("Tool loop exceeded limit");
}

/**
 * =========================
 * SUPERVISOR AGENT TOOL
 * =========================
 */
export const getNextResponseFromCoralAiAgent = tool({
  name: "getNextResponseFromCoralAiAgent",
  description: "Returns next supervisor-guided response",
  parameters: {
    type: "object",
    properties: {
      relevantContextFromLastUserMessage: { type: "string" },
    },
    required: ["relevantContextFromLastUserMessage"],
    additionalProperties: false,
  },

  execute: async (input, details) => {
    const history: RealtimeItem[] = (details?.context as any)?.history ?? [];

    const body = {
      model: "gpt-4.1",
      input: [
        {
          type: "message",
          role: "system",
          content: supervisorAgentInstructions,
        },
        {
          type: "message",
          role: "user",
          content: JSON.stringify(history, null, 2),
        },
      ],
      tools: supervisorAgentTools,
    };

    const response = await fetchResponsesMessage(body);
    if (response?.error) return { error: true };

    const finalText = await handleToolCalls(
      body,
      response,
      (details?.context as any)?.addTranscriptBreadcrumb
    );

    return { nextResponse: finalText };
  },
});
