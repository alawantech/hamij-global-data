"use client";
import { useEffect } from "react";
import {
  CheckCircle2,
  Phone,
  Wifi,
  Tv,
  Zap,
  GraduationCap,
  RefreshCcw,
  MessageSquare,
  Wallet,
  CreditCard,
  Repeat,
  Copy,
  Download,
  Printer,
} from "lucide-react";
import toast from "react-hot-toast";

const SVC_MAP = {
  airtime: { color: "#f97316", bg: "#fff7ed", Icon: Phone, label: "Airtime" },
  atc: { color: "#0d9488", bg: "#ccfbf1", Icon: Repeat, label: "Airtime to Cash" },
  data: { color: "#4f46e5", bg: "#eff6ff", Icon: Wifi, label: "Data" },
  cable: { color: "#7c3aed", bg: "#f5f3ff", Icon: Tv, label: "Cable TV" },
  electricity: { color: "#d97706", bg: "#fffbeb", Icon: Zap, label: "Electricity" },
  exam: { color: "#059669", bg: "#ecfdf5", Icon: GraduationCap, label: "Exam Pin" },
  sms: { color: "#0369a1", bg: "#f0f9ff", Icon: MessageSquare, label: "Bulk SMS" },
  wallet: { color: "#0891b2", bg: "#ecfeff", Icon: Wallet, label: "Wallet" },
  card: { color: "#16a34a", bg: "#f0fdf4", Icon: CreditCard, label: "Card" },
  pin: { color: "#db2777", bg: "#fdf2f8", Icon: CreditCard, label: "Pin" },
  other: { color: "#0891b2", bg: "#ecfeff", Icon: RefreshCcw, label: "Transaction" },
};

export function getSvcMeta(category, servicename = "") {
  if (SVC_MAP[category]) return SVC_MAP[category];
  const l = (servicename || "").toLowerCase();
  for (const [k, v] of Object.entries(SVC_MAP))
    if (l.includes(k)) return v;
  return SVC_MAP.other;
}

export function SvcStatus(s) {
  if (s === 1 || s === "success" || s === "successful")
    return { cls: "badge-success", label: "Successful" };
  if (s === 0 || s === "failed") return { cls: "badge-failed", label: "Failed" };
  return { cls: "badge-pending", label: "Pending" };
}

function fmtNaira(n) {
  const v = Math.abs(parseFloat(n || 0));
  return "₦" + v.toLocaleString("en-NG", { minimumFractionDigits: 2 });
}

export default function ReceiptView({ tx, showPrint = true }) {
  const category = tx.category || "other";
  const { color, bg, Icon, label } = getSvcMeta(category, tx.servicename);
  const st = SvcStatus(tx.status);
  const isDebit = parseFloat(tx.oldbal || 0) > parseFloat(tx.newbal || 0);

  const details = [
    { label: "Reference", value: tx.transref || tx.ref || "—", mono: true },
    { label: "Service", value: tx.servicename || label },
    { label: "Description", value: tx.servicedesc || "—" },
    {
      label: "Amount",
      value: `${isDebit ? "-" : "+"}${fmtNaira(tx.amount)}`,
      highlight: true,
      color: isDebit ? "#dc2626" : "#059669",
    },
    { label: "Previous Balance", value: fmtNaira(tx.oldbal) },
    { label: "New Balance", value: fmtNaira(tx.newbal) },
    {
      label: "Date",
      value: new Date(tx.date || tx.createdAt).toLocaleString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ];

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied!"));
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Please allow pop-ups to download receipt");
      return;
    }
    const rows = details
      .map(
        (d) =>
          `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px"><span style="color:#64748b">${d.label}</span><span style="font-weight:${d.highlight ? 900 : 600};color:${d.color || "#0f172a"};text-align:right;max-width:60%;word-break:break-word">${d.value}</span></div>`,
      )
      .join("");
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt ${tx.transref || ""}</title>
      <style>
        *{box-sizing:border-box;font-family:-apple-system,Segoe UI,Roboto,sans-serif}
        body{margin:0;padding:32px;background:#f8fafc;color:#0f172a}
        .card{max-width:420px;margin:0 auto;background:#fff;border-radius:20px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.08)}
        .head{text-align:center;margin-bottom:18px}
        .check{width:64px;height:64px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#16a34a;font-size:34px}
        .amt{font-size:30px;font-weight:900;color:${isDebit ? "#dc2626" : "#059669"};text-align:center;margin:6px 0}
        .badge{display:inline-block;background:#dcfce7;color:#16a34a;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700}
        .foot{text-align:center;color:#94a3b8;font-size:11px;margin-top:18px}
        .brand{text-align:center;font-weight:800;color:#4f46e5;font-size:15px;margin-bottom:4px}
      </style></head>
      <body><div class="card">
        <div class="brand">GUCHOR-MONIE</div>
        <div class="head"><div class="check">✓</div>
        <div style="font-weight:700;color:#475569;font-size:13px">${label} Receipt</div>
        <div class="amt">${isDebit ? "-" : "+"}${fmtNaira(tx.amount)}</div>
        <span class="badge">${st.label}</span></div>
        ${rows}
        <div class="foot">Thank you for using GUCHOR-MONIE.<br/>Receipt generated ${new Date().toLocaleString("en-NG")}</div>
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print()},300);};</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div className="receipt-sheet">
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          <Icon size={30} color={color} strokeWidth={1.75} />
        </div>
        <p style={{ color: "#64748b", fontSize: ".8rem", marginBottom: 4 }}>
          {label} Receipt
        </p>
        <p
          style={{
            fontWeight: 900,
            fontSize: "1.9rem",
            letterSpacing: "-.03em",
            color: isDebit ? "#dc2626" : "#059669",
            margin: "0 0 8px",
          }}
        >
          {isDebit ? "-" : "+"}
          {fmtNaira(tx.amount)}
        </p>
        <span
          className={`badge ${st.cls}`}
          style={{ fontSize: ".78rem", padding: ".3rem .85rem" }}
        >
          {st.label}
        </span>
      </div>

      {/* Details */}
      <div
        style={{
          background: "#fff",
          borderRadius: "1.25rem",
          overflow: "hidden",
          border: "1px solid #f1f5f9",
        }}
      >
        {details.map((d, i) => (
          <div
            key={d.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: ".85rem 1.1rem",
              borderBottom:
                i < details.length - 1 ? "1px solid #f4f4f5" : "none",
            }}
          >
            <span style={{ fontSize: ".8rem", color: "#71717a", flexShrink: 0 }}>
              {d.label}
            </span>
            <span
              style={{
                fontSize: ".85rem",
                fontWeight: d.highlight ? 900 : 600,
                color: d.color || "#09090b",
                textAlign: "right",
                maxWidth: "62%",
                wordBreak: "break-all",
                fontFamily: d.mono ? "monospace" : "inherit",
              }}
            >
              {d.value}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: ".625rem", marginTop: "1rem" }}>
        <button
          onClick={() => copy(tx.transref || tx.ref || "")}
          style={{
            flex: 1,
            background: "#fff",
            border: "1.5px solid #e4e4e7",
            borderRadius: "1rem",
            padding: ".85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: ".4rem",
            fontWeight: 700,
            fontSize: ".82rem",
            color: "#4f46e5",
            cursor: "pointer",
          }}
        >
          <Copy size={16} /> Copy Ref
        </button>
        {showPrint && (
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              background: "#4f46e5",
              border: "none",
              borderRadius: "1rem",
              padding: ".85rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: ".4rem",
              fontWeight: 700,
              fontSize: ".82rem",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <Download size={16} /> Receipt
          </button>
        )}
      </div>
    </div>
  );
}
