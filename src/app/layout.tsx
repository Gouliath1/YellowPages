import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yellow Pages Demo",
  description: "Fast people finder with search-as-you-type and quick actions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased bg-slate-950 text-slate-50"
      >
        {children}
      </body>
    </html>
  );
}
