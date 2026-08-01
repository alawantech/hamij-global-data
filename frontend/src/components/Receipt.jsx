"use client";
import { useState } from "react";
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
  ShieldCheck,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSiteSettings } from "@/context/SiteSettingsContext";

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
  return "\u20A6" + v.toLocaleString("en-NG", { minimumFractionDigits: 2 });
}

function fetchLogoAsDataUrl(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext("2d").drawImage(img, 0, 0);
        resolve(c.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function buildReceiptHtml(details, tx, siteName, logoDataUrl, label, st, isDebit) {
  const logoSection = logoDataUrl
    ? `<img src="${logoDataUrl}" style="height:48px;width:auto;object-fit:contain;margin-bottom:6px;border-radius:8px" />`
    : `<div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 6px;color:#fff;font-weight:900;font-size:20px;letter-spacing:-1px">${siteName.charAt(0)}</div>`;

  const rows = details
    .map(
      (d) =>
        `<tr><td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;white-space:nowrap">${d.label}</td><td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:${d.highlight ? 900 : 600};color:${d.color || "#0f172a"};text-align:right;word-break:break-word">${d.value}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Receipt ${tx.transref || ""}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
  body{padding:0;background:#f1f5f9;color:#0f172a;display:flex;justify-content:center}
  .receipt{width:440px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.08)}
  .hero{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:28px 24px 22px;text-align:center;color:#fff;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-30px;right:-30px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.07)}
  .hero::after{content:'';position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.05)}
  .site{font-size:15px;font-weight:800;letter-spacing:.3px;margin-bottom:14px;position:relative}
  .check{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:28px;position:relative;backdrop-filter:blur(4px)}
  .svc{font-size:13px;font-weight:600;opacity:.85;margin-bottom:4px;position:relative}
  .amt{font-size:32px;font-weight:900;letter-spacing:-.5px;position:relative}
  .badge{display:inline-block;background:rgba(255,255,255,.18);color:#fff;padding:5px 18px;border-radius:99px;font-size:11px;font-weight:700;margin-top:10px;backdrop-filter:blur(4px);position:relative}
  .details{padding:4px 0}
  .foot{text-align:center;padding:16px 24px 22px;color:#94a3b8;font-size:11px;line-height:1.6;border-top:1px solid #f1f5f9}
</style></head>
<body><div class="receipt">
  <div class="hero">
    <div style="position:relative">${logoSection}</div>
    <div class="site">${siteName}</div>
    <div class="check">\u2713</div>
    <div class="svc">${label} Receipt</div>
    <div class="amt">${isDebit ? "-" : "+"}${fmtNaira(tx.amount)}</div>
    <span class="badge">${st.label}</span>
  </div>
  <table class="details" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  <div class="foot">\u{1F6E1}\uFE0F Secured &amp; verified by ${siteName}<br/>Receipt generated ${new Date().toLocaleString("en-NG")}</div>
</div></body></html>`;
}

export default function ReceiptView({ tx, showPrint = true }) {
  const [downloading, setDownloading] = useState(false);
  const settings = useSiteSettings();
  const siteName = settings.sitename || "Gwarzo Data Sub";
  const logoUrl = settings.logoUrl || "";

  const category = tx.category || "other";
  const { color, bg, Icon, label } = getSvcMeta(category, tx.servicename);
  const st = SvcStatus(tx.status);
  const isDebit = parseFloat(tx.oldbal || 0) > parseFloat(tx.newbal || 0);

  const details = [
    { label: "Reference", value: tx.transref || tx.ref || "\u2014", mono: true },
    { label: "Service", value: tx.servicename || label },
    { label: "Description", value: tx.servicedesc || "\u2014" },
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

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const logoDataUrl = await fetchLogoAsDataUrl(logoUrl);
      const html = buildReceiptHtml(details, tx, siteName, logoDataUrl, label, st, isDebit);

      const container = document.createElement("div");
      container.innerHTML = html.replace(/<!DOCTYPE[^>]*>/, "").replace(/<\/?html[^>]*>/g, "").replace(/<\/?head[^>]*>/g, "").replace(/<\/?body[^>]*>/g, "");
      container.style.cssText = "position:fixed;left:-9999px;top:0;width:440px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;";
      document.body.appendChild(container);

      const width = 440;
      const height = container.scrollHeight || 700;

      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;min-height:${height}px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
            ${container.innerHTML}
          </div>
        </foreignObject>
      </svg>`;

      document.body.removeChild(container);

      const img = new Image();
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = (img.naturalHeight || height) * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, img.naturalHeight || height);
      URL.revokeObjectURL(url);

      const pngBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      const downloadUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `receipt-${tx.transref || "transaction"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

      toast.success("Receipt downloaded!");
    } catch (err) {
      console.error("PNG download failed, falling back to print:", err);
      handlePrint();
    } finally {
      setDownloading(false);
    }
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
          `<tr><td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;white-space:nowrap">${d.label}</td><td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:${d.highlight ? 900 : 600};color:${d.color || "#0f172a"};text-align:right;word-break:break-word">${d.value}</td></tr>`
      )
      .join("");
    const logoSection = logoUrl
      ? `<img src="${logoUrl}" style="height:48px;width:auto;object-fit:contain;margin-bottom:6px;border-radius:8px" />`
      : `<div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#4f46e5);display:flex;align-items:center;justify-content:center;margin:0 auto 6px;color:#fff;font-weight:900;font-size:18px;letter-spacing:-1px">${siteName.charAt(0)}</div>`;
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt ${tx.transref || ""}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
        body{padding:24px;background:#f1f5f9;color:#0f172a}
        .receipt{max-width:420px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08)}
        .hero{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:28px 24px 22px;text-align:center;color:#fff}
        .check{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:28px}
        .amt{font-size:30px;font-weight:900;color:#fff;text-align:center;margin:6px 0}
        .badge{display:inline-block;background:rgba(255,255,255,.18);color:#fff;padding:4px 16px;border-radius:99px;font-size:11px;font-weight:700}
        .foot{text-align:center;color:#94a3b8;font-size:11px;margin-top:18px}
      </style></head>
      <body><div class="receipt">
        <div class="hero">
          <div style="margin-bottom:8px">${logoSection}</div>
          <div style="font-size:15px;font-weight:800;letter-spacing:.3px;margin-bottom:14px">${siteName}</div>
          <div class="check">\u2713</div>
          <div style="font-weight:600;opacity:.85;font-size:13px;margin-bottom:4px">${label} Receipt</div>
          <div class="amt">${isDebit ? "-" : "+"}${fmtNaira(tx.amount)}</div>
          <span class="badge">${st.label}</span>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:4px 0">${rows}</table>
        <div class="foot">\u{1F6E1}\uFE0F Secured &amp; verified by ${siteName}<br/>Receipt generated ${new Date().toLocaleString("en-NG")}</div>
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print()},300);};</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div className="receipt-sheet">
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          borderRadius: "1.25rem",
          padding: "1.5rem 1.25rem 1.25rem",
          textAlign: "center",
          marginBottom: "1rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,.07)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -20,
            left: -20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,.05)",
          }}
        />
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={siteName}
            style={{
              height: 48,
              width: "auto",
              objectFit: "contain",
              marginBottom: 4,
              filter: "brightness(0) invert(1)",
              position: "relative",
            }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(255,255,255,.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 4px",
              color: "#fff",
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: -1,
              backdropFilter: "blur(4px)",
              position: "relative",
            }}
          >
            {siteName.charAt(0)}
          </div>
        )}
        <div
          style={{
            color: "rgba(255,255,255,.9)",
            fontSize: ".82rem",
            fontWeight: 800,
            letterSpacing: ".3px",
            marginBottom: 14,
            position: "relative",
          }}
        >
          {siteName}
        </div>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(255,255,255,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 8px",
            backdropFilter: "blur(4px)",
            position: "relative",
          }}
        >
          <CheckCircle2 size={28} color="#fff" strokeWidth={2.5} />
        </div>
        <div
          style={{
            color: "rgba(255,255,255,.8)",
            fontSize: ".75rem",
            fontWeight: 600,
            marginBottom: 4,
            position: "relative",
          }}
        >
          {label} Receipt
        </div>
        <div
          style={{
            fontWeight: 900,
            fontSize: "1.75rem",
            letterSpacing: "-.04em",
            color: "#fff",
            margin: "0 0 10px",
            position: "relative",
          }}
        >
          {isDebit ? "-" : "+"}
          {fmtNaira(tx.amount)}
        </div>
        <span
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,.18)",
            color: "#fff",
            padding: "5px 18px",
            borderRadius: 99,
            fontSize: ".72rem",
            fontWeight: 700,
            backdropFilter: "blur(4px)",
            position: "relative",
          }}
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
          boxShadow: "0 2px 12px rgba(0,0,0,.03)",
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

      {/* Secured badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginTop: ".85rem",
          color: "#a1a1aa",
          fontSize: ".7rem",
          fontWeight: 600,
        }}
      >
        <ShieldCheck size={13} />
        Secured &amp; verified by {siteName}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: ".625rem", marginTop: ".75rem" }}>
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
            onClick={handleDownload}
            disabled={downloading}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
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
              cursor: downloading ? "wait" : "pointer",
              boxShadow: "0 4px 14px rgba(79,70,229,.3)",
              opacity: downloading ? 0.7 : 1,
            }}
          >
            {downloading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Downloading...
              </>
            ) : (
              <>
                <Download size={16} /> Download Receipt
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
