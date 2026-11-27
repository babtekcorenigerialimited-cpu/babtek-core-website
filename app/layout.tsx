import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: {
    default: "BABTEK Core Nigeria Limited | Building a Better Future",
    template: "%s | BABTEK Core Nigeria Limited",
  },
  description:
    "A multidisciplinary Nigerian enterprise bringing together built-environment expertise, technology and business development.",
  applicationName: "BABTEK Core Nigeria Limited",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><SiteChrome>{children}</SiteChrome></body>
    </html>
  );
}
