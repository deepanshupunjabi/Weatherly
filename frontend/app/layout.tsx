import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weatherly — Feel the Weather",
  description: "A beautiful 3D live weather experience.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
