import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Library Frontend",
  description: "Frontend application for the My Library API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
