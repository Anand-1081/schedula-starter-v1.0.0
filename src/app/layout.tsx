import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/features/auth/hooks/use-session";
import { DoctorSessionProvider } from "@/features/doctor-portal/hooks/use-doctor-session";
import { PatientSessionProvider } from "@/features/patient/hooks/use-patient-session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Schedula | Clinic operations",
  description: "A production-minded starter for doctor appointment booking workflows.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <DoctorSessionProvider>
            <PatientSessionProvider>{children}</PatientSessionProvider>
          </DoctorSessionProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
