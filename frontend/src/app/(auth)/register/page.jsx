"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, User, Mail, Phone, Gift } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import AppLogo from "@/components/AppLogo";
import NumericPasswordInput from "@/components/NumericPasswordInput";

const PERKS = [
  "Free account — no monthly fees",
  "Instant wallet funding",
  "Best data & airtime rates",
  "Earn by referring friends",
];

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1); // 1: User details, 2: Password, 3: Confirm password
  const [userDetails, setUserDetails] = useState({
    fullname: "",
    email: "",
    phone: "",
    referral: "",
  });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUserDetailsChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinueToPassword = async (e) => {
    e.preventDefault();
    if (!userDetails.fullname.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!userDetails.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (!userDetails.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    // Validate email/phone doesn't already exist
    setLoading(true);
    try {
      const response = await api.post("/auth/check-account", {
        email: userDetails.email,
        phone: userDetails.phone,
      });

      if (response.data.data?.exists) {
        const field = response.data.data.field;
        if (field === "both") {
          toast.error("📧 Email and 📱 phone number are already registered.\n\nPlease log in or use different credentials.");
        } else if (field === "email") {
          toast.error("📧 This email is already registered.\n\nPlease log in or use a different email.");
        } else if (field === "phone") {
          toast.error("📱 This phone number is already registered.\n\nPlease log in or use a different phone number.");
        }
        setLoading(false);
        return;
      }

      // Account is available, proceed
      setLoading(false);
      setStep(2);
    } catch (err) {
      toast.error("Error checking account. Please try again.");
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (passwordValue) => {
    // User has entered password on step 2, move to step 3 for confirmation
    setPassword(passwordValue);
    setStep(3);
  };

  const handleConfirmPasswordSubmit = async (confirmValue) => {
    if (password !== confirmValue) {
      toast.error("Passwords do not match");
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        fullname: userDetails.fullname.trim(),
        email: userDetails.email,
        phone: userDetails.phone,
        password: password,
        referral: userDetails.referral.trim() || undefined,
      });
      await refreshUser();
      toast.success("Account created successfully!");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Registration failed");
      setLoading(false);
    }
  };

  const labelStyle = {
    display: "block",
    fontSize: ".8rem",
    fontWeight: 600,
    color: "#374151",
    marginBottom: ".3rem",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Left Panel */}
      <div
        style={{
          flex: 1,
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "4rem 3rem",
          position: "relative",
          overflow: "hidden",
          minWidth: 0,
        }}
        className="auth-left-panel"
      >
        <div
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(37,99,235,.2)",
            filter: "blur(80px)",
            bottom: 0,
            right: 0,
          }}
        />

        <div style={{ position: "relative" }}>
          <Link
            href="/home"
            style={{
              textDecoration: "none",
              marginBottom: "3rem",
              display: "inline-flex",
            }}
          >
            <AppLogo showBrandName={false} logoHeight={90} dark={false} />
          </Link>

          <h2
            style={{
              fontSize: "2.25rem",
              fontWeight: 900,
              color: "white",
              lineHeight: 1.15,
              marginBottom: "1rem",
              letterSpacing: "-.03em",
            }}
          >
            Join Thousands of
            <br />
            Happy Users
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,.6)",
              fontSize: "1rem",
              marginBottom: "2.5rem",
              lineHeight: 1.6,
            }}
          >
            Create your free account today and start saving on all your utility
            payments.
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {PERKS.map((p) => (
              <div
                key={p}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".875rem",
                }}
              >
                <CheckCircle size={18} color="#34d399" />
                <span
                  style={{ color: "rgba(255,255,255,.75)", fontSize: ".9rem" }}
                >
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "2rem 2.5rem",
          overflowY: "auto",
        }}
      >
        {/* Mobile brand */}
        <div className="mobile-brand">
          <Link href="/home" style={{ textDecoration: "none" }}>
            <AppLogo showBrandName={false} logoHeight={64} dark={false} />
          </Link>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-.03em",
            }}
          >
            Create your account
          </h1>
          <p
            style={{
              color: "#64748b",
              marginTop: ".375rem",
              fontSize: ".875rem",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "#2563eb",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Step 1: User Details */}
        {step === 1 && (
          <form
            onSubmit={handleContinueToPassword}
            style={{ display: "flex", flexDirection: "column", gap: ".875rem" }}
          >
            {/* Full Name Input */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User
                  size={18}
                  style={{
                    position: "absolute",
                    left: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                />
                <input
                  className="form-input"
                  placeholder="John Doe"
                  name="fullname"
                  value={userDetails.fullname}
                  onChange={handleUserDetailsChange}
                  required
                  style={{ paddingLeft: "2.75rem" }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                />
                <input
                  className="form-input"
                  type="email"
                  placeholder="john@example.com"
                  name="email"
                  value={userDetails.email}
                  onChange={handleUserDetailsChange}
                  required
                  style={{ paddingLeft: "2.75rem" }}
                />
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label style={labelStyle}>Phone Number</label>
              <div style={{ position: "relative" }}>
                <Phone
                  size={18}
                  style={{
                    position: "absolute",
                    left: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                />
                <input
                  className="form-input"
                  type="tel"
                  placeholder="08012345678"
                  name="phone"
                  value={userDetails.phone}
                  onChange={handleUserDetailsChange}
                  required
                  maxLength={11}
                  style={{ paddingLeft: "2.75rem" }}
                />
              </div>
            </div>
            {/* Referral Code Input */}
            <div>
              <label style={labelStyle}>Referral Code (optional)</label>
              <div style={{ position: "relative" }}>
                <Gift
                  size={18}
                  style={{
                    position: "absolute",
                    left: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                />
                <input
                  className="form-input"
                  placeholder="Enter referral code (optional)"
                  name="referral"
                  value={userDetails.referral}
                  onChange={handleUserDetailsChange}
                  style={{ paddingLeft: "2.75rem" }}
                />
              </div>
            </div>
            <p style={{ fontSize: ".75rem", color: "#94a3b8", lineHeight: 1.5, marginTop: ".5rem" }}>
              By registering you agree to our{" "}
              <Link href="/privacy" style={{ color: "#2563eb" }}>
                Privacy Policy
              </Link>{" "}
              and Terms of Service.
            </p>
            <button
              type="submit"
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: ".5rem",
              }}
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Step 2: Password */}
        {step === 2 && (
          <NumericPasswordInput
            title="Set Your Password"
            description="Create an 8-digit password for your account. Use only numbers 0-9."
            onSubmit={handlePasswordSubmit}
            isLoading={loading}
          />
        )}

        {/* Step 3: Confirm Password */}
        {step === 3 && (
          <NumericPasswordInput
            title="Confirm Your Password"
            description="Re-enter your 8-digit password to confirm."
            onSubmit={handleConfirmPasswordSubmit}
            isLoading={loading}
            onBack={() => {
              setStep(2);
              setPassword("");
            }}
          />
        )}

      </div>

      <style>{`
        @media (max-width: 768px) { .auth-left-panel { display: none !important; } }
        @media (min-width: 769px) { .mobile-brand { display: none !important; } }
      `}</style>
    </div>
  );
}
