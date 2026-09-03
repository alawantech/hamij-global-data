import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Us - Hamij Global Data | Get Support",
  description:
    "Contact Hamij Global Data for support. Available 24/7 via WhatsApp, email, and in-app support. We respond within 24 hours.",
  keywords: [
    "contact Hamij Global Data",
    "customer support Nigeria",
    "VTU support",
    "Hamij Global Data help",
  ],
  openGraph: {
    title: "Contact Us - Hamij Global Data | Get Support",
    description:
      "Contact Hamij Global Data for support. Available 24/7 via WhatsApp, email, and in-app support.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact Us - Hamij Global Data | Get Support",
    description:
      "Contact Hamij Global Data for support. Available 24/7 via WhatsApp, email, and in-app support.",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
