import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Denop Hostel Wifi",
  description: "Hotspot billing & management system for Denop Hostel Wifi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
