"use client";

import { FormEvent, useMemo, useState } from "react";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviews: number;
  fee: number;
  image: string;
};

type Booking = {
  doctor: Doctor;
  date: string;
  time: string;
  patientName: string;
  patientEmail: string;
  reason: string;
};

const DEMO_EMAIL = "demo@schedula.com";
const DEMO_PASSWORD = "demo123";

const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Ananya Sharma",
    specialty: "Cardiologist",
    experience: 12,
    rating: 4.9,
    reviews: 184,
    fee: 800,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "2",
    name: "Dr. Rahul Mehta",
    specialty: "Dermatologist",
    experience: 9,
    rating: 4.8,
    reviews: 156,
    fee: 600,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "3",
    name: "Dr. Priya Kapoor",
    specialty: "Pediatrician",
    experience: 11,
    rating: 4.9,
    reviews: 211,
    fee: 700,
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "4",
    name: "Dr. Arjun Verma",
    specialty: "Neurologist",
    experience: 15,
    rating: 4.7,
    reviews: 132,
    fee: 1000,
    image: "https://randomuser.me/api/portraits/men/46.jpg",
  },
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:30 AM",
  "01:00 PM",
  "03:00 PM",
  "04:30 PM",
  "06:00 PM",
];

export default function Home() {
  const [page, setPage] = useState<
    "login" | "doctors" | "booking" | "success"
  >("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");

  const [selectedDoctor, setSelectedDoctor] =
    useState<Doctor | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [reason, setReason] = useState("");

  const [bookingError, setBookingError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);

  const specialties = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(doctors.map((doctor) => doctor.specialty))
      ),
    ],
    []
  );

  const filteredDoctors = useMemo(() => {
    const query = search.toLowerCase().trim();

    return doctors.filter((doctor) => {
      const matchesSearch =
        !query ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query);

      const matchesSpecialty =
        specialty === "All" ||
        doctor.specialty === specialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [search, specialty]);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    if (!email.trim()) {
      setLoginError("Please enter your email.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setLoginError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setLoginError("Please enter your password.");
      return;
    }

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setLoginError(
        "Invalid credentials. Please use the demo account."
      );
      return;
    }

    setPage("doctors");
  }

  function useDemoAccount() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setLoginError("");
  }

  function openBooking(doctor: Doctor) {
    setSelectedDoctor(doctor);
    setSelectedDate("");
    setSelectedTime("");
    setPatientName("");
    setPatientEmail(email);
    setReason("");
    setBookingError("");
    setPage("booking");
  }

  async function confirmBooking(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setBookingError("");

    if (!selectedDoctor) return;

    if (!selectedDate) {
      setBookingError("Please select a date.");
      return;
    }

    if (!selectedTime) {
      setBookingError("Please select a time slot.");
      return;
    }

    if (!patientName.trim()) {
      setBookingError("Please enter the patient's name.");
      return;
    }

    if (
      !patientEmail.trim() ||
      !/\S+@\S+\.\S+/.test(patientEmail)
    ) {
      setBookingError("Please enter a valid patient email.");
      return;
    }

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          date: selectedDate,
          time: selectedTime,
          patientName,
          patientEmail,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      setBooking({
        doctor: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        patientName,
        patientEmail,
        reason,
      });

      setPage("success");
    } catch {
      setBookingError(
        "Unable to confirm the appointment. Please try again."
      );
    }
  }

  /* LOGIN */

  if (page === "login") {
    return (
      <main className="min-h-screen bg-[var(--canvas)] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-[var(--line)] p-8">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[var(--brand)] text-white flex items-center justify-center text-xl font-bold mb-5">
                S
              </div>

              <h1 className="text-3xl font-bold text-[var(--ink)]">
                Welcome to Schedula
              </h1>

              <p className="text-[var(--muted)] mt-2">
                Sign in to manage your appointments.
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--brand)]"
                />
              </div>

              {loginError && (
                <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--brand)] text-white py-3.5 font-semibold hover:bg-[var(--brand-deep)]"
              >
                Sign in
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">
                Demo Account
              </p>

              <div className="mt-2 space-y-1 text-sm text-emerald-800">
                <p>
                  <span className="font-medium">
                    Email:
                  </span>{" "}
                  {DEMO_EMAIL}
                </p>

                <p>
                  <span className="font-medium">
                    Password:
                  </span>{" "}
                  {DEMO_PASSWORD}
                </p>
              </div>

              <button
                type="button"
                onClick={useDemoAccount}
                className="mt-3 w-full rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                Use demo account
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* DOCTOR LISTING */

  if (page === "doctors") {
    return (
      <main className="min-h-screen bg-[var(--canvas)]">
        <header className="bg-white border-b border-[var(--line)]">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--ink)]">
                Schedula
              </h1>

              <p className="text-sm text-[var(--muted)]">
                Find the right doctor for you
              </p>
            </div>

            <button
              onClick={() => {
                setEmail("");
                setPassword("");
                setPage("login");
              }}
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="max-w-6xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--ink)]">
              Find a doctor
            </h2>

            <p className="text-[var(--muted)] mt-2">
              Browse trusted specialists and book an appointment.
            </p>
          </div>

          <div className="bg-white border border-[var(--line)] rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search doctor or specialty..."
              className="flex-1 rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--brand)]"
            />

            <select
              value={specialty}
              onChange={(event) =>
                setSpecialty(event.target.value)
              }
              className="rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--brand)]"
            >
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white border border-[var(--line)] rounded-2xl p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start gap-4">
                  {/* DOCTOR PICTURE */}

                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[var(--ink)]">
                      {doctor.name}
                    </h3>

                    <p className="text-[var(--brand)] font-medium">
                      {doctor.specialty}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-3 text-sm">
                      <span>
                        ⭐ {doctor.rating}
                      </span>

                      <span className="text-[var(--muted)]">
                        {doctor.reviews} reviews
                      </span>

                      <span className="text-[var(--muted)]">
                        {doctor.experience} yrs exp.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-[var(--line)]">
                  <div>
                    <p className="text-xs text-[var(--muted)]">
                      Consultation fee
                    </p>

                    <p className="font-bold text-[var(--ink)]">
                      ₹{doctor.fee}
                    </p>
                  </div>

                  <button
                    onClick={() => openBooking(doctor)}
                    className="rounded-xl bg-[var(--brand)] text-white px-5 py-3 font-semibold hover:bg-[var(--brand-deep)]"
                  >
                    Book appointment
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-20 text-[var(--muted)]">
              No doctors found.
            </div>
          )}
        </section>
      </main>
    );
  }

  /* BOOKING */

  if (page === "booking" && selectedDoctor) {
    return (
      <main className="min-h-screen bg-[var(--canvas)]">
        <header className="bg-white border-b border-[var(--line)]">
          <div className="max-w-4xl mx-auto px-6 py-5">
            <button
              onClick={() => setPage("doctors")}
              className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
            >
              ← Back to doctors
            </button>
          </div>
        </header>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold text-[var(--ink)]">
            Book appointment
          </h1>

          <p className="text-[var(--muted)] mt-2 mb-8">
            Choose your preferred date and available time.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-[var(--line)] rounded-2xl p-6 h-fit">
              <div className="w-20 h-20 rounded-2xl overflow-hidden">
                <img
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="font-bold text-lg mt-4">
                {selectedDoctor.name}
              </h2>

              <p className="text-[var(--brand)] font-medium">
                {selectedDoctor.specialty}
              </p>

              <div className="mt-4 text-sm text-[var(--muted)]">
                ⭐ {selectedDoctor.rating} ·{" "}
                {selectedDoctor.experience} years
              </div>

              <div className="mt-5 pt-5 border-t border-[var(--line)]">
                <span className="text-sm text-[var(--muted)]">
                  Consultation fee
                </span>

                <p className="font-bold">
                  ₹{selectedDoctor.fee}
                </p>
              </div>
            </div>

            <form
              onSubmit={confirmBooking}
              className="md:col-span-2 bg-white border border-[var(--line)] rounded-2xl p-6"
            >
              <div className="mb-7">
                <label className="block font-semibold text-[var(--ink)] mb-3">
                  Select date
                </label>

                <input
                  type="date"
                  value={selectedDate}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(event) =>
                    setSelectedDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div className="mb-7">
                <label className="block font-semibold text-[var(--ink)] mb-3">
                  Available slots
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() =>
                        setSelectedTime(slot)
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-medium ${
                        selectedTime === slot
                          ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                          : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand)]"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                    Patient name
                  </label>

                  <input
                    value={patientName}
                    onChange={(event) =>
                      setPatientName(event.target.value)
                    }
                    placeholder="Full name"
                    className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--brand)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                    Patient email
                  </label>

                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(event) =>
                      setPatientEmail(event.target.value)
                    }
                    placeholder="patient@example.com"
                    className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                  Reason for visit
                </label>

                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="Briefly describe your concern..."
                  rows={4}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--brand)] resize-none"
                />
              </div>

              {bookingError && (
                <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm mb-5">
                  {bookingError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--brand)] text-white py-3.5 font-semibold hover:bg-[var(--brand-deep)]"
              >
                Confirm appointment
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  /* SUCCESS */

  if (page === "success" && booking) {
    return (
      <main className="min-h-screen bg-[var(--canvas)] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-[var(--line)] rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>

          <h1 className="text-3xl font-bold text-[var(--ink)] mt-6">
            Appointment confirmed
          </h1>

          <p className="text-[var(--muted)] mt-2">
            Your appointment has been successfully booked.
          </p>

          <div className="text-left bg-[var(--canvas)] rounded-2xl p-5 mt-7 space-y-4">
            <div>
              <p className="text-xs text-[var(--muted)]">
                Doctor
              </p>

              <p className="font-semibold">
                {booking.doctor.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-[var(--muted)]">
                Date & Time
              </p>

              <p className="font-semibold">
                {booking.date} · {booking.time}
              </p>
            </div>

            <div>
              <p className="text-xs text-[var(--muted)]">
                Patient
              </p>

              <p className="font-semibold">
                {booking.patientName}
              </p>
            </div>

            <div>
              <p className="text-xs text-[var(--muted)]">
                Consultation fee
              </p>

              <p className="font-semibold">
                ₹{booking.doctor.fee}
              </p>
            </div>
          </div>

          <button
            onClick={() => setPage("doctors")}
            className="w-full mt-7 rounded-xl bg-[var(--brand)] text-white py-3.5 font-semibold hover:bg-[var(--brand-deep)]"
          >
            Back to doctors
          </button>
        </div>
      </main>
    );
  }

  return null;
}