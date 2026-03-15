import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PsychAssist | Local AI",
  description: "Private Local AI Psychology Assistant",
};

export default function RootLayout({ children }) {
  return (
    // THE ULTIMATE LOCK: "fixed inset-0 overflow-hidden" directly on the root HTML
    <html lang="en" className="h-[100dvh] w-screen overflow-hidden fixed inset-0 m-0 p-0 bg-[#050810]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full overflow-hidden flex flex-col m-0 p-0 text-gray-200`}
      >
        {children}
      </body>
    </html>
  );
}