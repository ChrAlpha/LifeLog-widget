import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeLog Widget",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-600">
          {children}
        </div>
      </body>
    </html>
  );
}
