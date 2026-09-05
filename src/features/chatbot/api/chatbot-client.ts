async function parse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Something went wrong");
  return body.data as T;
}

export async function sendChatMessage(patientId: string, message: string): Promise<string> {
  const response = await fetch("/api/patient/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId, message }),
  });
  const data = await parse<{ reply: string }>(response);
  return data.reply;
}
