import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Us - Guchor Data | Get Support",
  description:
    "Contact Guchor Data for support. Available 24/7 via WhatsApp, email, and in-app support. We respond within 24 hours.",
  keywords: [
    "contact Guchor Data",
    "customer support Nigeria",
    "VTU support",
    "Guchor Data help",
  ],
  openGraph: {
    title: "Contact Us - Guchor Data | Get Support",
    description:
      "Contact Guchor Data for support. Available 24/7 via WhatsApp, email, and in-app support.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact Us - Guchor Data | Get Support",
    description:
      "Contact Guchor Data for support. Available 24/7 via WhatsApp, email, and in-app support.",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
