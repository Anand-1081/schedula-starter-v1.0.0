import { bookings, getPrescriptionByBooking, patientAccounts } from "@/lib/mock-data/store";
import { formatLongDate, formatTime12h, toDateTime } from "@/lib/utils/date";
import type { BookingConfirmation } from "@/types/booking";

/**
 * A small, dependency-free "chatbot" for the patient portal. This has no
 * real language model behind it - it looks at the patient's own mock data
 * (bookings, prescriptions) and matches a handful of keywords to produce a
 * helpful, on-topic reply. Good enough for the demo; swap the body of
 * `getChatbotReply` out for a real LLM call later without touching the
 * API route or the widget.
 *
 * It also runs a very small "symptom checker" flow: if the patient
 * mentions a common complaint (headache, fever, stomach ache, etc.) the
 * bot first asks for their temperature and a bit more detail, then
 * replies with simple self-care guidance. This is general wellness
 * information only, not a diagnosis - the replies always point the
 * patient toward booking a real doctor for anything serious.
 */

// ---------------------------------------------------------------------------
// Symptom checker
// ---------------------------------------------------------------------------

type SymptomKey =
  | "headache"
  | "fever"
  | "stomachache"
  | "cold"
  | "cough"
  | "soreThroat"
  | "bodyAche"
  | "nausea"
  | "diarrhea"
  | "backPain";

type SymptomInfo = {
  label: string;
  care: string[];
  medicine: string[];
  avoid: string[];
  seekHelp: string[];
};

const SYMPTOM_LIBRARY: Record<SymptomKey, SymptomInfo> = {
  headache: {
    label: "headache",
    care: [
      "Rest in a quiet, dimly lit room for a while.",
      "Drink a full glass of water - dehydration is a common trigger.",
      "Try a cold compress on your forehead or a warm compress on your neck/shoulders.",
      "Keep your meals regular; skipping meals can bring on headaches.",
    ],
    medicine: [
      "A standard adult dose of paracetamol (acetaminophen), or ibuprofen if you tolerate it, taken as directed on the package, usually helps.",
    ],
    avoid: [
      "Loud noise, bright screens, and strong smells.",
      "Skipping sleep or meals.",
      "Alcohol and caffeine until it settles.",
    ],
    seekHelp: [
      "the headache is the \"worst of your life\" or came on suddenly and severely",
      "it's with a stiff neck, confusion, fainting, or vision changes",
      "it follows a head injury",
      "it lasts more than 2-3 days despite rest and medicine",
    ],
  },
  fever: {
    label: "fever",
    care: [
      "Rest and drink plenty of fluids - water, ORS, coconut water, or soup.",
      "Wear light clothing and keep the room comfortably cool.",
      "A lukewarm sponge bath can help bring the temperature down.",
      "Check your temperature every few hours to track how it's trending.",
    ],
    medicine: [
      "Paracetamol (acetaminophen) at the standard adult dose on the label is usually the first choice for bringing a fever down.",
    ],
    avoid: [
      "Heavy blankets or very warm rooms.",
      "Cold-water baths or ice (they can cause shivering, which raises temperature further).",
      "Mixing multiple fever medicines without checking labels.",
    ],
    seekHelp: [
      "the temperature is 103°F (39.4°C) or higher",
      "the fever lasts more than 2-3 days",
      "it comes with a rash, severe headache, stiff neck, difficulty breathing, or repeated vomiting",
      "it's a child, an elderly person, or someone with an existing health condition",
    ],
  },
  stomachache: {
    label: "stomach ache",
    care: [
      "Sip small amounts of water or ORS often, rather than large amounts at once.",
      "Try a light diet - plain rice, bananas, toast, curd (the classic \"BRAT\"-style foods).",
      "A warm compress or hot water bag on the abdomen can ease cramping.",
      "Rest and avoid lying flat right after eating.",
    ],
    medicine: [
      "An antacid can help if it feels like gas or acidity; paracetamol (not ibuprofen, which can irritate the stomach) can be used for pain, as directed on the label.",
    ],
    avoid: [
      "Spicy, oily, or very heavy meals.",
      "Caffeine, alcohol, and carbonated drinks.",
      "Taking ibuprofen or aspirin on an already upset stomach.",
    ],
    seekHelp: [
      "the pain is severe, or concentrated in the lower-right abdomen",
      "there's vomiting blood, black stools, or you can't keep fluids down",
      "it comes with high fever or a rigid, very tender belly",
      "it lasts more than 2 days or keeps getting worse",
    ],
  },
  cold: {
    label: "cold",
    care: [
      "Rest and stay well hydrated with warm fluids - soup, tea, or warm water with honey and lemon.",
      "Steam inhalation can loosen a blocked/runny nose.",
      "Gargle with warm salt water if your throat feels scratchy.",
      "Use a humidifier or a bowl of water in the room if the air is dry.",
    ],
    medicine: [
      "Paracetamol can ease any aches; a saline nasal spray or common cold/cough syrup can ease congestion - check the label for your age and any conditions.",
    ],
    avoid: [
      "Smoking or smoky environments.",
      "Cold drinks and ice cream while your throat is irritated.",
      "Sharing utensils/towels with others so it doesn't spread.",
    ],
    seekHelp: [
      "symptoms last more than 10 days without improving",
      "you develop a high fever, chest pain, or shortness of breath",
      "ear pain or facial pain/pressure develops (possible sinus or ear infection)",
      "you have an existing lung or heart condition",
    ],
  },
  cough: {
    label: "cough",
    care: [
      "Sip warm water, herbal tea, or warm water with honey and lemon through the day.",
      "Gargle with warm salt water for a scratchy throat.",
      "Use a humidifier, or sit in a steamy bathroom for a few minutes.",
      "Prop your head up a little at night if coughing disturbs your sleep.",
    ],
    medicine: [
      "An over-the-counter cough syrup suited to your type of cough (dry vs. productive) can help - a pharmacist can point you to the right one.",
    ],
    avoid: [
      "Smoking, smoke, or dusty/polluted air.",
      "Cold drinks, ice cream, and very spicy food while the throat is irritated.",
    ],
    seekHelp: [
      "the cough lasts more than 2-3 weeks",
      "you're coughing up blood or thick discolored mucus",
      "it comes with high fever, breathlessness, or chest pain",
      "you have asthma, COPD, or another chronic lung condition",
    ],
  },
  soreThroat: {
    label: "sore throat",
    care: [
      "Gargle with warm salt water a few times a day.",
      "Drink warm fluids - tea with honey, warm water with lemon.",
      "Suck on throat lozenges or hard candy to keep the throat moist.",
      "Rest your voice as much as you can.",
    ],
    medicine: [
      "Paracetamol or ibuprofen at the standard adult dose can ease the pain; medicated lozenges can also help.",
    ],
    avoid: [
      "Smoking, spicy food, and very cold or very hot drinks.",
      "Shouting or straining your voice.",
    ],
    seekHelp: [
      "the pain is severe or you have trouble swallowing or breathing",
      "you see white patches on the tonsils, or have a high fever",
      "it lasts more than a week",
      "you've been near someone with strep throat",
    ],
  },
  bodyAche: {
    label: "body ache",
    care: [
      "Rest and get extra sleep - the body repairs itself while resting.",
      "A warm bath or warm compress on sore muscles can help.",
      "Gentle stretching once the acute soreness eases.",
      "Stay hydrated.",
    ],
    medicine: [
      "Paracetamol or ibuprofen at the standard adult dose usually eases general body ache.",
    ],
    avoid: [
      "Strenuous exercise until it settles.",
      "Alcohol, which can worsen dehydration and muscle soreness.",
    ],
    seekHelp: [
      "it comes with high fever, a rash, or severe weakness",
      "one area is swollen, red, or hot to the touch",
      "it follows an injury and the pain is severe",
      "it lasts more than a week",
    ],
  },
  nausea: {
    label: "nausea",
    care: [
      "Sip clear fluids slowly - water, ORS, or ginger tea.",
      "Eat small, bland amounts - crackers, toast, plain rice - rather than a big meal.",
      "Get fresh air and avoid strong smells.",
      "Rest sitting up rather than lying flat.",
    ],
    medicine: [
      "Ginger (tea, candy) is a gentle first step; an over-the-counter antacid or anti-nausea tablet can help - check the label or ask a pharmacist.",
    ],
    avoid: [
      "Greasy, spicy, or very sweet food.",
      "Lying down right after eating.",
      "Strong odors (perfume, smoke, cooking smells).",
    ],
    seekHelp: [
      "you can't keep any fluids down for more than a day",
      "there's vomiting blood or what looks like coffee grounds",
      "it comes with severe abdominal pain, high fever, or a bad headache",
      "there are signs of dehydration (very little urine, dizziness, dry mouth)",
    ],
  },
  diarrhea: {
    label: "diarrhea",
    care: [
      "Drink ORS (oral rehydration solution) or water frequently, in small sips.",
      "Eat light, bland food once you feel able - rice, banana, toast, curd.",
      "Rest, and wash your hands often to avoid spreading it.",
    ],
    medicine: [
      "ORS is the most important \"medicine\" here; an over-the-counter anti-diarrheal can be used for short-term relief if there's no fever or blood in the stool - check the label.",
    ],
    avoid: [
      "Dairy (except curd/yogurt), fried, and spicy food.",
      "Caffeine and alcohol.",
      "Untreated water.",
    ],
    seekHelp: [
      "there's blood in the stool, or a high fever",
      "it lasts more than 2 days",
      "you show signs of dehydration (little urine, dizziness, dry mouth)",
      "it's a young child or an elderly person",
    ],
  },
  backPain: {
    label: "back pain",
    care: [
      "Rest briefly, but gentle movement is usually better than staying completely still.",
      "Apply a warm compress or heating pad to the area.",
      "Maintain good posture when sitting, and use a firm-ish mattress.",
      "Gentle stretching once the sharpest pain eases.",
    ],
    medicine: [
      "Paracetamol or ibuprofen at the standard adult dose can ease the pain; a topical pain-relief gel/spray can also help.",
    ],
    avoid: [
      "Heavy lifting or bending awkwardly until it improves.",
      "Prolonged bed rest (short rest is fine, but staying still too long can slow recovery).",
    ],
    seekHelp: [
      "there's numbness, tingling, or weakness in the legs",
      "it follows a fall or injury",
      "it comes with fever, or loss of bladder/bowel control",
      "it lasts more than a week or is getting worse",
    ],
  },
};

const SYMPTOM_PATTERNS: Array<{ key: SymptomKey; pattern: RegExp }> = [
  { key: "headache", pattern: /(headache|migraine|head\s*pain|head\s*ache)/ },
  { key: "fever", pattern: /(fever|temperature|feeling hot|chills)/ },
  { key: "stomachache", pattern: /(stomach\s*ache|stomach\s*pain|tummy\s*ache|abdominal pain|belly\s*ache|gastric)/ },
  { key: "soreThroat", pattern: /(sore throat|throat pain|throat ache|scratchy throat)/ },
  { key: "cough", pattern: /\bcough(ing)?\b/ },
  { key: "cold", pattern: /\b(cold|runny nose|blocked nose|stuffy nose|sneezing)\b/ },
  { key: "bodyAche", pattern: /(body\s*ache|body\s*pain|muscle\s*pain|muscle\s*ache|joint\s*pain)/ },
  { key: "nausea", pattern: /(nausea|nauseous|feel like vomiting|throwing up|vomit)/ },
  { key: "diarrhea", pattern: /(diarrhea|diarrhoea|loose motion|loose stool)/ },
  { key: "backPain", pattern: /(back\s*pain|back\s*ache)/ },
];

function detectSymptom(message: string): SymptomKey | null {
  for (const { key, pattern } of SYMPTOM_PATTERNS) {
    if (pattern.test(message)) return key;
  }
  return null;
}

type TemperatureReading = { fahrenheit: number; raw: string };

function parseTemperature(message: string): TemperatureReading | null {
  // e.g. "101 F", "38.5 C", "38.5°C", "101.2"
  const celsiusMatch = message.match(/(\d{2,3}(?:\.\d+)?)\s*°?\s*c\b/i);
  if (celsiusMatch) {
    const c = parseFloat(celsiusMatch[1]);
    return { fahrenheit: c * 1.8 + 32, raw: celsiusMatch[0] };
  }
  const fahrenheitMatch = message.match(/(\d{2,3}(?:\.\d+)?)\s*°?\s*f\b/i);
  if (fahrenheitMatch) {
    return { fahrenheit: parseFloat(fahrenheitMatch[1]), raw: fahrenheitMatch[0] };
  }
  // A bare number with no unit: guess based on plausible range.
  const bareMatch = message.match(/\b(\d{2,3}(?:\.\d+)?)\b/);
  if (bareMatch) {
    const value = parseFloat(bareMatch[1]);
    if (value >= 34 && value <= 43) {
      // Looks like Celsius
      return { fahrenheit: value * 1.8 + 32, raw: bareMatch[0] };
    }
    if (value >= 95 && value <= 110) {
      // Looks like Fahrenheit
      return { fahrenheit: value, raw: bareMatch[0] };
    }
  }
  return null;
}

function mentionsNoFever(message: string): boolean {
  return /\b(no fever|not feeling hot|normal temperature|no temperature|don'?t have a fever|dont have a fever)\b/.test(message);
}

type PendingSymptomCheck = {
  symptom: SymptomKey;
  askedAt: number;
};

// In-memory per-patient conversation state for the symptom checker, kept
// alongside the rest of the mock "database" in this demo (no real session
// store). Resets on server restart, same as everything in mock-data/store.
const pendingSymptomChecks = new Map<string, PendingSymptomCheck>();

function askForDetails(symptom: SymptomKey, name: string): string {
  const label = SYMPTOM_LIBRARY[symptom].label;
  return `I'm sorry to hear you have a ${label}, ${name.split(" ")[0]}. Before I suggest anything, could you tell me:\n1) Your current body temperature (or just say "no fever" if you don't have one), and\n2) How long you've had it and how severe it feels (mild, moderate, or severe)?\n\nThis helps me give you accurate self-care advice.`;
}

function buildSymptomAdvice(symptom: SymptomKey, patientMessage: string): string {
  const info = SYMPTOM_LIBRARY[symptom];
  const temperature = parseTemperature(patientMessage);
  const noFever = mentionsNoFever(patientMessage);

  const lines: string[] = [];

  if (temperature) {
    const tempLabel = `${temperature.fahrenheit.toFixed(1)}°F`;
    if (temperature.fahrenheit >= 103) {
      lines.push(
        `A temperature of ${tempLabel} is a high fever - please book an appointment with a doctor (or visit urgent care) rather than just self-treating at home.`,
      );
    } else if (temperature.fahrenheit >= 100.4) {
      lines.push(`Noted - ${tempLabel} counts as a fever, so I've included fever care below too.`);
    } else {
      lines.push(`Good, ${tempLabel} is within the normal range.`);
    }
  } else if (noFever) {
    lines.push("Good, no fever noted.");
  }

  lines.push(`Here's what usually helps with a ${info.label}:`);
  lines.push(info.care.map((item) => `- ${item}`).join("\n"));

  lines.push("\nMedicine (over-the-counter):");
  lines.push(info.medicine.map((item) => `- ${item}`).join("\n"));

  lines.push("\nAvoid:");
  lines.push(info.avoid.map((item) => `- ${item}`).join("\n"));

  const showHighFeverWarning = symptom !== "fever" && !!temperature && temperature.fahrenheit >= 103;
  lines.push("\nPlease see a doctor if:");
  const seekHelp = [...info.seekHelp];
  if (showHighFeverWarning) {
    seekHelp.unshift("your fever is 103°F (39.4°C) or higher");
  }
  lines.push(seekHelp.map((item) => `- ${item}`).join("\n"));

  lines.push(
    "\nThis is general self-care guidance, not a diagnosis. If anything feels off or isn't improving, it's always worth booking a doctor on Schedula - I can take you to \"Find a doctor\" whenever you're ready.",
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Everything else (appointments, prescriptions, doctors, profile)
// ---------------------------------------------------------------------------

function upcomingFor(patientId: string): BookingConfirmation[] {
  const now = new Date();
  return bookings
    .filter((booking) => booking.userId === patientId)
    .filter((booking) => booking.status === "confirmed" || booking.status === "pending")
    .filter((booking) => toDateTime(booking.date, booking.time).getTime() >= now.getTime())
    .sort((a, b) => toDateTime(a.date, a.time).getTime() - toDateTime(b.date, b.time).getTime());
}

function completedFor(patientId: string): BookingConfirmation[] {
  return bookings
    .filter((booking) => booking.userId === patientId && booking.status === "completed")
    .sort((a, b) => toDateTime(b.date, b.time).getTime() - toDateTime(a.date, a.time).getTime());
}

function describeBooking(booking: BookingConfirmation): string {
  return `${booking.doctorName} on ${formatLongDate(booking.date)} at ${formatTime12h(booking.time)}`;
}

function greeting(name: string): string {
  return `Hi ${name.split(" ")[0]}! I'm Dr. Schedula, your health assistant. Tell me your symptoms (headache, fever, stomach ache, cough...) and I'll walk you through some care advice, or ask me about your appointments, prescriptions, or finding a doctor.`;
}

export function getChatbotReply(patientId: string, rawMessage: string): string {
  const message = rawMessage.trim().toLowerCase();
  const patient = patientAccounts.find((account) => account.id === patientId);
  const name = patient?.name ?? "there";

  if (!message) {
    return "Could you type your question? I can help with symptoms, appointments, prescriptions, or doctors.";
  }

  // If we're mid symptom-check, treat this message as the patient's answer
  // (temperature + duration/severity) and give advice, regardless of what
  // else the message contains.
  const pending = pendingSymptomChecks.get(patientId);
  if (pending) {
    pendingSymptomChecks.delete(patientId);
    return buildSymptomAdvice(pending.symptom, message);
  }

  if (/\b(hi|hello|hey)\b/.test(message)) {
    return greeting(name);
  }

  if (/\b(thank|thanks)\b/.test(message)) {
    return "You're welcome! Anything else I can help with?";
  }

  const symptom = detectSymptom(message);
  if (symptom) {
    pendingSymptomChecks.set(patientId, { symptom, askedAt: Date.now() });
    return askForDetails(symptom, name);
  }

  if (/(prescription|medication|dosage)/.test(message)) {
    const withRx = completedFor(patientId).filter((booking) => booking.prescriptionAvailable);
    if (withRx.length === 0) {
      return "I don't see any prescriptions on your account yet. Once a doctor completes your visit and adds one, it'll show up under the \"Completed\" tab on your appointments page, where you can view and download it as a PDF.";
    }
    const latest = withRx[0];
    const prescription = getPrescriptionByBooking(latest.id);
    if (!prescription) {
      return `Your visit with ${latest.doctorName} on ${formatLongDate(latest.date)} is marked as having a prescription - open it from your "Completed" appointments tab to view and download it.`;
    }
    const meds = prescription.medicines.map((medicine) => medicine.name).filter(Boolean).join(", ") || "no medicines listed";
    return `Your most recent prescription is from ${latest.doctorName} (${formatLongDate(latest.date)}) for "${prescription.diagnosis}". Medicines: ${meds}. You can view the full details and download it as a PDF from the "Completed" tab on your appointments page.`;
  }

  if (/(appointment|visit|booking|schedule)/.test(message)) {
    const upcoming = upcomingFor(patientId);
    if (upcoming.length === 0) {
      return "You don't have any upcoming appointments. Want to book one? Head to \"Find a doctor\" to see available doctors and slots.";
    }
    const next = upcoming[0];
    const more = upcoming.length > 1 ? ` You have ${upcoming.length - 1} more after that.` : "";
    return `Your next appointment is with ${describeBooking(next)}. Status: ${next.status}.${more}`;
  }

  if (/(cancel|reschedule)/.test(message)) {
    return "To cancel or reschedule, go to \"My appointments\", open the visit, and use the options there. If it's already confirmed, the doctor will be notified automatically.";
  }

  if (/(doctor|specialist|book)/.test(message)) {
    return "You can browse doctors by specialty and book a slot from the \"Find a doctor\" page. Once booked, the doctor will confirm your appointment.";
  }

  if (/(profile|details|insurance|emergency contact)/.test(message)) {
    return "You can update your medical details, insurance, and emergency contact from the \"Profile\" page in the menu.";
  }

  return "I can help with symptoms (like headache, fever, or stomach ache), appointments, prescriptions, doctors, or your profile - could you tell me a bit more about what you need?";
}
