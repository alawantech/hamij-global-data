import type { Metadata } from "next";
import DeleteAccountContent from "./DeleteAccountContent";

export const metadata: Metadata = {
  title: "Delete Your Account - Hamij Global Data",
  description:
    "Learn how to delete your Hamij Global Data account and request deletion of your personal data. Steps, what is deleted, what is kept, and retention periods.",
  keywords: [
    "delete account",
    "account deletion",
    "Hamij Global Data",
    "data deletion",
  ],
  openGraph: {
    title: "Delete Your Account - Hamij Global Data",
    description:
      "Learn how to delete your Hamij Global Data account and request deletion of your personal data.",
  },
  twitter: {
    title: "Delete Your Account - Hamij Global Data",
    description:
      "Learn how to delete your Hamij Global Data account and request deletion of your personal data.",
  },
  alternates: {
    canonical: "/delete-account",
  },
};

export default function DeleteAccount() {
  return <DeleteAccountContent />;
}
