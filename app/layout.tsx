import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Omnimart - صندوق الأناقة",
  description: "صندوق الأناقة - هدية مثالية تحتوي على ساعة فاخرة وإكسسوارات أنيقة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
