import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  to: string | string[];
  subject?: string;
  username: string;
  department: string;
  ticketNo: string;
  issueTitle: string;
  issueDetails: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.to || (Array.isArray(body.to) && body.to.length === 0)) {
      return NextResponse.json(
        { ok: false, error: "Missing 'to'" },
        { status: 400 }
      );
    }
    const { SendMail } = await import("./mailGateway");

    const res = await SendMail(body.to, {
      subject: body.subject,
      username: body.username,
      department: body.department,
      ticketNo: body.ticketNo,
      issueTitle: body.issueTitle,
      issueDetails: body.issueDetails,
    });

    return NextResponse.json({ ok: true, result: res });
  } catch (err: any) {
    const message = err?.message ?? "Failed to send mail";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
