"use client";
import { createContext, useContext, useEffect, useState } from "react";

const DEFAULT = {
  sitename: "GUCHOR-MONIE",
  sitetitle: "",
  sitedesc:
    "Nigeria's most reliable VTU platform. Buy airtime, data, pay bills and more.",
  siteurl: "",
  address: "",
  logoUrl: "",
  faviconUrl: "",
  phone: "",
  email: "",
  whatsapp: "",
  telegram: "",
  facebook: "",
  instagram: "",
  twitter: "",
  accountName: "",
  accountNo: "",
  bankName: "",
};

const SiteSettingsContext = createContext(DEFAULT);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT);

  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v2";
    fetch(`${base}/public/settings`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.settings) {
          setSettings((prev) => ({ ...prev, ...d.data.settings }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
