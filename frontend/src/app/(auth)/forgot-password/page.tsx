import type { Metadata } from "next";
import ForgotPasswordContent from "./ForgotPasswordContent";

export const metadata: Metadata = {
  title: "Forgot Password - Guchor Data",
  description:
    "Reset your Guchor Data account password. Fast and secure password recovery.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/forgot-password",
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
