import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Us - Hamij Global Data | Nigeria's Leading VTU Platform",
  description:
    "Learn about Hamij Global Data, Nigeria's most trusted VTU platform for airtime, data, cable TV, electricity payments and more. Fast, secure, and reliable.",
  keywords: [
    "about Hamij Global Data",
    "VTU platform Nigeria",
    "Nigeria airtime data provider",
    "trusted VTU service",
  ],
  openGraph: {
    title: "About Us - Hamij Global Data | Nigeria's Leading VTU Platform",
    description:
      "Learn about Hamij Global Data, Nigeria's most trusted VTU platform for airtime, data, cable TV, electricity payments and more.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About Us - Hamij Global Data | Nigeria's Leading VTU Platform",
    description:
      "Learn about Hamij Global Data, Nigeria's most trusted VTU platform for airtime, data, cable TV, electricity payments and more.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
