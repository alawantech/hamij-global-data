import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Us - Guchor Data | Nigeria's Leading VTU Platform",
  description:
    "Learn about Guchor Data, Nigeria's most trusted VTU platform for airtime, data, cable TV, electricity payments and more. Fast, secure, and reliable.",
  keywords: [
    "about Guchor Data",
    "VTU platform Nigeria",
    "Nigeria airtime data provider",
    "trusted VTU service",
  ],
  openGraph: {
    title: "About Us - Guchor Data | Nigeria's Leading VTU Platform",
    description:
      "Learn about Guchor Data, Nigeria's most trusted VTU platform for airtime, data, cable TV, electricity payments and more.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About Us - Guchor Data | Nigeria's Leading VTU Platform",
    description:
      "Learn about Guchor Data, Nigeria's most trusted VTU platform for airtime, data, cable TV, electricity payments and more.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
