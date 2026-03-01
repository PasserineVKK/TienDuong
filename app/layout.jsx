import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "TIEN DUONG - Package Delivery Helper",
  description:
    "Help your neighbors pick up packages. Request help or volunteer to deliver.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b6cf5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased bg-background text-foreground">
        <main className="mx-auto max-w-[430px] min-h-screen">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
