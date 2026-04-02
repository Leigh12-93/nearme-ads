import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CheapX Ad Network — Advertise Across Australia's Biggest Service Directories",
  description:
    "Reach customers searching for tradies and services. Advertise your business across CheapSkipBinsNearMe, CheapElectriciansNearMe, CheapPlumbersNearMe, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
