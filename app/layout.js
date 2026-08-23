import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Two display faces, each with one job. The serif carries the hero, where
// the italic emphasises a single word. The grotesque carries every heading
// below it, so the page reads as an opening statement followed by a
// different, more mechanical voice rather than one serif all the way down.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Relative OG/Twitter image paths need an absolute base to resolve against.
// VERCEL_PROJECT_PRODUCTION_URL is injected by Vercel on every deployment,
// so this stays correct in production without asking anyone to configure a
// site-url env var locally.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dev Portfolio Builder",
    template: "%s | Dev Portfolio Builder",
  },
  description:
    "Upload a resume, pick from twelve genuinely different templates, and deploy a developer portfolio to your own GitHub and Vercel. You keep the repo.",
  openGraph: {
    title: "Dev Portfolio Builder",
    description:
      "Upload a resume, pick from twelve genuinely different templates, and deploy a developer portfolio to your own GitHub and Vercel. You keep the repo.",
    url: "/",
    siteName: "Dev Portfolio Builder",
    images: [{ url: "/portfolio-generator-logo.png", width: 1024, height: 1024 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dev Portfolio Builder",
    description: "Twelve developer portfolio templates. Deployed to your own GitHub and Vercel.",
    images: ["/portfolio-generator-logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
