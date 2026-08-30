import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      doctorId,
      doctorName,
      date,
      time,
      patientName,
      patientEmail,
      reason,
    } = body;

    if (
      !doctorId ||
      !doctorName ||
      !date ||
      !time ||
      !patientName ||
      !patientEmail
    ) {
      return NextResponse.json(
        { message: "Missing required booking details." },
        { status: 400 }
      );
    }

    const appointment = {
      id: crypto.randomUUID(),
      doctorId,
      doctorName,
      date,
      time,
      patientName,
      patientEmail,
      reason: reason || "",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(appointment, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Invalid request." },
      { status: 400 }
    );
  }
}