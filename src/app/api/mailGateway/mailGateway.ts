import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export type SendMailResult = {
  accepted?: string[];
  rejected?: string[];
  messageId?: string;
  response?: string;
};

export type SendTicketMailParams = {
  to: string | string[];
  cc?: string | string[];
  subject?: string;
  username: string;
  department: string;
  ticketNo: string;
  issueTitle: string;
  issueDetails: string;
};

function applyTemplate(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(/{(\w+)}/g, (_, key) => values[key] ?? `{${key}}`);
}

function getMailConfigFromEnv() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } =
    process.env;

  if (!SMTP_HOST) throw new Error("SMTP_HOST is missing");
  if (!SMTP_PORT) throw new Error("SMTP_PORT is missing");
  if (!SMTP_USER) throw new Error("SMTP_USER is missing");
  if (!SMTP_PASS) throw new Error("SMTP_PASS is missing");

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    from: SMTP_FROM ?? SMTP_USER,
  };
}

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const cfg = getMailConfigFromEnv();

  cachedTransporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.auth,
  });

  return cachedTransporter;
}

export async function sendAIIvrsTicketMail(
  params: SendTicketMailParams
): Promise<SendMailResult> {
  const textTemplate = process.env.MAIL_TEXT_PREFIX;
  if (!textTemplate) {
    throw new Error("MAIL_TEXT_PREFIX is missing in .env");
  }

  const subjectTemplate = params.subject ?? process.env.MAIL_DEFAULT_SUBJECT;

  if (!subjectTemplate) {
    throw new Error("MAIL_DEFAULT_SUBJECT is missing in .env");
  }

  const transporter = getTransporter();
  const cfg = getMailConfigFromEnv();
  const dateTime = new Date().toLocaleString();

  const text = applyTemplate(textTemplate, {
    username: params.username,
    department: params.department,
    ticket_no: params.ticketNo,
    issue_title: params.issueTitle,
    issue_details: params.issueDetails,
    date_time: dateTime,
  });

  const subject = applyTemplate(subjectTemplate, {
    issue_title: params.issueTitle,
  });

  const info = await transporter.sendMail({
    from: cfg.from,
    to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
    cc: params.cc
      ? Array.isArray(params.cc)
        ? params.cc.join(", ")
        : params.cc
      : undefined,
    subject,
    text,
  });

  return {
    accepted: info.accepted as string[],
    rejected: info.rejected as string[],
    messageId: info.messageId,
    response: info.response,
  };
}

export const SendMail = (
  to: string | string[],
  params: Omit<SendTicketMailParams, "to">
) => {
  return sendAIIvrsTicketMail({ to, ...params });
};
