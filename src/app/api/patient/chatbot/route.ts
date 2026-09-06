import { patientAccounts } from "@/lib/mock-data/store";
import { getChatbotReply } from "@/lib/chatbot/respond";

type PostBody = {
  patientId?: string;
  message?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as PostBody;

  if (!body.patientId) {
    return Response.json({ error: "patientId is required" }, { status: 400 });
  }
  if (!patientAccounts.some((account) => account.id === body.patientId)) {
    return Response.json({ error: "Patient account not found" }, { status: 404 });
  }
  const message = body.message?.trim();
  if (!message) {
    return Response.json({ error: "A message is required" }, { status: 400 });
  }

  const reply = getChatbotReply(body.patientId, message);

  return Response.json({ data: { reply } });
}
