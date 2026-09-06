import { availabilityRules } from "@/lib/mock-data/store";

type RouteContext = { params: Promise<{ ruleId: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
  const { ruleId } = await params;
  const url = new URL(request.url);
  const doctorId = url.searchParams.get("doctorId");

  const index = availabilityRules.findIndex((rule) => rule.id === ruleId);
  if (index === -1) {
    return Response.json({ error: "Availability rule not found" }, { status: 404 });
  }
  if (doctorId && availabilityRules[index].doctorId !== doctorId) {
    return Response.json({ error: "Not authorized to remove this rule" }, { status: 403 });
  }

  availabilityRules.splice(index, 1);
  return Response.json({ data: { deleted: true } });
}
