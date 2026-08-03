"use client";
import { useEffect, useState } from "react";
import {
  Users,
  ArrowLeftRight,
  TrendingUp,
  Wallet,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Shield,
} from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useAdmin } from "@/context/AdminContext";

export default function AdminDashboardPage() {
  const { admin, hasPermission } = useAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState([]);
  const [providerBalances, setProviderBalances] = useState([]);
  const [balLoading, setBalLoading] = useState(true);
  const [provBalLoading, setProvBalLoading] = useState(true);

  if (!hasPermission("dashboard_view")) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
        <Shield size={48} style={{ margin: "0 auto 1rem", opacity: .3 }} />
        <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>Access Denied</h2>
        <p style={{ fontSize: ".85rem" }}>You don't have permission to view this page.</p>
      </div>
    );
  }

  const loadBalances = () => {
    setBalLoading(true);
    adminApi
      .get("/admin/provider-balances")
      .then((r) => setBalances(r.data.data?.balances || []))
      .catch(() => {})
      .finally(() => setBalLoading(false));
  };

  const loadProviderBalances = () => {
    setProvBalLoading(true);
    adminApi
      .get("/admin/data-providers/balances")
      .then((r) => setProviderBalances(r.data.data?.balances || []))
      .catch(() => {})
      .finally(() => setProvBalLoading(false));
  };

  useEffect(() => {
    adminApi
      .get("/admin/stats")
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    loadBalances();
    loadProviderBalances();
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
        Loading stats...
      </div>
    );
  if (!stats)
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#ef4444" }}>
        Failed to load stats.
      </div>
    );

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers?.toLocaleString() || 0,
      icon: Users,
      color: "#2563eb",
      sub: `${stats.agentCount || 0} agents · ${stats.vendorCount || 0} vendors`,
    },
    {
      label: "Total Transactions",
      value: stats.totalTransactions?.toLocaleString() || 0,
      icon: ArrowLeftRight,
      color: "#7c3aed",
      sub: `${stats.successCount || 0} success · ${stats.failedCount || 0} failed`,
    },
    {
      label: "Total Revenue",
      value: `₦${parseFloat(stats.totalRevenue || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "#059669",
      sub: "All-time profit",
    },
    {
      label: "Wallet Balances",
      value: `₦${parseFloat(stats.totalWalletBalance || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
      icon: Wallet,
      color: "#d97706",
      sub: "Total user wallets",
    },
    {
      label: "Open Issues",
      value: stats.openIssues?.toLocaleString() || 0,
      icon: MessageSquare,
      color: "#dc2626",
      sub: "Awaiting reply",
    },
    {
      label: "Pending Transactions",
      value: stats.pendingCount?.toLocaleString() || 0,
      icon: AlertCircle,
      color: "#f59e0b",
      sub: "Needs review",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 900,
            color: "#0f172a",
            letterSpacing: "-.03em",
          }}
        >
          Dashboard Overview
        </h1>
        <p
          style={{ color: "#64748b", fontSize: ".875rem", marginTop: ".25rem" }}
        >
          Welcome back. Here's what's happening.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
          gap: "1.25rem",
        }}
      >
        {cards.map(({ label, value, icon: Icon, color, sub }) => (
          <div
            key={label}
            style={{
              background: "white",
              borderRadius: "1.25rem",
              padding: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,.05)",
              border: "1px solid #f1f5f9",
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: color + "15",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={22} color={color} />
            </div>
            <div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: ".75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: "1.5rem",
                  color: "#0f172a",
                  letterSpacing: "-.02em",
                  lineHeight: 1.2,
                  margin: ".25rem 0",
                }}
              >
                {value}
              </div>
              <div style={{ color: "#94a3b8", fontSize: ".75rem" }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Provider API Wallet Balances */}
      <div style={{ marginTop: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-.02em",
              }}
            >
              Provider API Wallets
            </h2>
            <p
              style={{
                fontSize: ".75rem",
                color: "#94a3b8",
                margin: ".2rem 0 0",
              }}
            >
              Live balances from your configured VTU API providers
            </p>
          </div>
          <button
            onClick={() => { loadBalances(); loadProviderBalances(); }}
            disabled={balLoading || provBalLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".4rem",
              background: "white",
              border: "1.5px solid #e2e8f0",
              borderRadius: ".75rem",
              padding: ".4rem .875rem",
              cursor: balLoading ? "not-allowed" : "pointer",
              fontSize: ".78rem",
              fontWeight: 700,
              color: "#475569",
              fontFamily: "inherit",
            }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: (balLoading || provBalLoading) ? "spin 1s linear infinite" : "none",
              }}
            />
            Refresh
          </button>
        </div>

        {balLoading ? (
          <div
            style={{
              background: "white",
              borderRadius: "1rem",
              padding: "2rem",
              textAlign: "center",
              color: "#94a3b8",
              border: "1px solid #f1f5f9",
              fontSize: ".875rem",
            }}
          >
            Fetching provider balances…
          </div>
        ) : balances.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "1rem",
              padding: "2rem",
              textAlign: "center",
              color: "#94a3b8",
              border: "1px solid #f1f5f9",
              fontSize: ".875rem",
            }}
          >
            No provider wallets configured. Go to{" "}
            <a
              href="/admin/api-configs"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              API Config → Provider Wallets
            </a>{" "}
            to set them up.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: "1rem",
            }}
          >
            {balances.map((b) => (
              <div
                key={b.slot}
                style={{
                  background: "white",
                  borderRadius: "1.25rem",
                  padding: "1.25rem 1.5rem",
                  border: `1.5px solid ${b.error ? "#fecaca" : "#e0f2fe"}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                }}
              >
                <div
                  style={{
                    fontSize: ".7rem",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                    marginBottom: ".5rem",
                  }}
                >
                  {b.label}
                </div>
                {b.error ? (
                  <div
                    style={{
                      color: "#ef4444",
                      fontSize: ".8rem",
                      fontWeight: 600,
                    }}
                  >
                    ⚠ {b.error}
                  </div>
                ) : (
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: "1.5rem",
                      color: "#0284c7",
                      letterSpacing: "-.02em",
                    }}
                  >
                    ₦
                    {parseFloat(b.balance || 0).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Provider Wallet Balances */}
      {providerBalances.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                  letterSpacing: "-.02em",
                }}
              >
                Data Provider Wallets
              </h2>
              <p
                style={{
                  fontSize: ".75rem",
                  color: "#94a3b8",
                  margin: ".2rem 0 0",
                }}
              >
                Live balances from your configured data providers
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: "1rem",
            }}
          >
            {providerBalances.map((b) => (
              <div
                key={b.id}
                style={{
                  background: "white",
                  borderRadius: "1.25rem",
                  padding: "1.25rem 1.5rem",
                  border: `1.5px solid ${b.error ? "#fecaca" : "#e0f2fe"}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                }}
              >
                <div
                  style={{
                    fontSize: ".7rem",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                    marginBottom: ".5rem",
                  }}
                >
                  {b.name}
                  {b.username && (
                    <span style={{ color: "#cbd5e1", marginLeft: ".35rem", textTransform: "none" }}>
                      @{b.username}
                    </span>
                  )}
                </div>
                {b.error ? (
                  <div
                    style={{
                      color: "#ef4444",
                      fontSize: ".8rem",
                      fontWeight: 600,
                    }}
                  >
                    ⚠ {b.error}
                  </div>
                ) : (
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: "1.5rem",
                      color: "#0284c7",
                      letterSpacing: "-.02em",
                    }}
                  >
                    ₦
                    {parseFloat(b.balance || 0).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
