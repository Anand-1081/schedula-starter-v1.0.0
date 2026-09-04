import { notifications } from "@/lib/mock-data/store";

type RouteContext = { params: Promise<{ notificationId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const { notificationId } = await params;
  const body = (await request.json()) as { read?: boolean };

  const notification = notifications.find((item) => item.id === notificationId);
  if (!notification) {
    return Response.json({ error: "Notification not found" }, { status: 404 });
  }
  notification.read = body.read ?? true;
  return Response.json({ data: notification });
}
