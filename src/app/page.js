"use client";
import { useState, useCallback } from "react";

const COLUMNS = [
  { key: "broker", label: "BROKER" },
  { key: "sens", label: "SENS" },
  { key: "security", label: "TITRE" },
  { key: "isin", label: "ISIN" },
  { key: "quantity", label: "QUANTITÉ" },
  { key: "tradeDate", label: "DATE TRADE" },
  { key: "settlementDate", label: "DATE RÈGLEMENT" },
  { key: "totalValue", label: "VALEUR TOTALE" },
  { key: "prixUnitaire", label: "PRIX UNITAIRE" },
];

function SensBadge({ sens }) {
  const isAchat = sens === "Achat";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
      background: isAchat ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
      color: isAchat ? "#34d399" : "#f87171",
      border: `1px solid ${isAchat ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
    }}>
      <span style={{ fontSize: 8 }}>{isAchat ? "▲" : "▼"}</span>
      {sens}
    </span>
  );
}

function BrokerBadge({ broker }) {
  const isMakor = broker === "MAKOR";
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 4,
      fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
      background: isMakor ? "rgba(139,92,246,0.15)" : "rgba(251,191,36,0.1)",
      color: isMakor ? "#a78bfa" : "#fbbf24",
      border: `1px solid ${isMakor ? "rgba(139,92,246,0.35)" : "rgba(251,191,36,0.3)"}`,
    }}>
      {broker}
    </span>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 36 36" style={{ width: 20, height: 20, animation: "spin 0.9s linear infinite" }}>
      <circle cx="18" cy="18" r="14" fill="none" stroke="#6366f1" strokeWidth="3"
        strokeDasharray="60 30" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileNames, setFileNames] = useState([]);
  const [processingFile, setProcessingFile] = useState("");

  const fileToBase64 = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  const processFiles = useCallback(async (newFiles) => {
    const pdfs = Array.from(newFiles).filter((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    );
    if (!pdfs.length) return;
    setLoading(true);
    setError(null);
    const newTrades = [];
    const newNames = [];
    for (const file of pdfs) {
      setProcessingFile(file.name);
      try {
        const base64 = await fileToBase64(file);
        const res = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfBase64: base64 }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        newTrades.push(...data.trades);
        newNames.push(file.name);
      } catch (e) {
        setError(`Erreur sur "${file.name}": ${e.message}`);
      }
    }
    setTrades((prev) => [...prev, ...newTrades]);
    setFileNames((prev) => [...prev, ...newNames]);
    setLoading(false);
    setProcessingFile("");
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .trrow:hover td { background: rgba(255,255,255,0.025) !important; }
        * { box-sizing: border-box; }
      `}</style>
      <div style={{ background: "linear-gradient(90deg,#0b1120,#0f1929)", borderBottom: "1px solid #1a2438", padding: "16px 36px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⬡</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", letterSpacing: "0.05em" }}>CONFIRMATION PARSER</div>
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.18em" }}>WAFA GESTION · MAKOR · TRADITION · GEMINI</div>
          </div>
        </div>
        {trades.length > 0 && (
          <button onClick={() => { setTrades([]); setFileNames([]); }}
            style={{ background: "transparent", border: "1px solid #1e293b", color: "#64748b", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>
            ✕ EFFACER
          </button>
        )}
      </div>
      <div style={{ padding: "32px 36px" }}>
        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
          onClick={() => !loading && document.getElementById("fi").click()}
          style={{ border: `1.5px dashed ${dragOver ? "#6366f1" : "#1e293b"}`, borderRadius: 12, padding: "40px 24px", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.015)", marginBottom: 28 }}>
          <input id="fi" type="file" accept=".pdf" multiple onChange={(e) => processFiles(e.target.files)} style={{ display: "none" }} />
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Spinner />
              <div style={{ fontSize: 12, color: "#6366f1" }}>ANALYSE EN COURS — {processingFile}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 40, opacity: 0.25 }}>⤓</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>DÉPOSER LES CONFIRMATIONS PDF ICI</div>
              <div style={{ fontSize: 10, color: "#334155" }}>Cliquer ou glisser-déposer · MAKOR &amp; TRADITION</div>
            </div>
          )}
        </div>
        {fileNames.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {fileNames.map((f, i) => <span key={i} style={{ fontSize: 10, background: "#0f1929", border: "1px solid #1e293b", color: "#475569", padding: "4px 12px", borderRadius: 4 }}>✓ {f}</span>)}
          </div>
        )}
        {error && <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", padding: "12px 18px", borderRadius: 8, marginBottom: 24, fontSize: 11 }}>⚠ {error}</div>}
        {trades.length > 0 && (
          <div style={{ animation: "fadeIn 0.35s ease", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#0b1120", borderRadius: 10, overflow: "hidden", boxShadow: "0 0 0 1px #1a2438", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#0f1929" }}>
                  {COLUMNS.map((c) => <th key={c.key} style={{ padding: "12px 16px", textAlign: "left", fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: "#475569", borderBottom: "1px solid #1a2438", whiteSpace: "nowrap" }}>{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr key={i} className="trrow" style={{ borderBottom: "1px solid #0f1929" }}>
                    <td style={{ padding: "14px 16px" }}><BrokerBadge broker={t.broker} /></td>
                    <td style={{ padding: "14px 16px" }}><SensBadge sens={t.sens} /></td>
                    <td style={{ padding: "14px 16px", color: "#e2e8f0", fontFamily: "sans-serif", fontSize: 12 }}>{t.security}</td>
                    <td style={{ padding: "14px 16px", color: "#60a5fa" }}>{t.isin}</td>
                    <td style={{ padding: "14px 16px", color: "#e2e8f0", textAlign: "right" }}>{typeof t.quantity === "number" ? t.quantity.toLocaleString("fr-FR") : t.quantity}</td>
                    <td style={{ padding: "14px 16px", color: "#94a3b8", whiteSpace: "nowrap" }}>{t.tradeDate}</td>
                    <td style={{ padding: "14px 16px", color: "#94a3b8", whiteSpace: "nowrap" }}>{t.settlementDate}</td>
                    <td style={{ padding: "14px 16px", color: "#34d399", fontWeight: 600, textAlign: "right", whiteSpace: "nowrap" }}>{t.totalValue}</td>
                    <td style={{ padding: "14px 16px", color: "#fbbf24", textAlign: "right" }}>{typeof t.prixUnitaire === "number" ? t.prixUnitaire.toFixed(6) : t.prixUnitaire}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {trades.length === 0 && !loading && <div style={{ textAlign: "center", marginTop: 60, fontSize: 11, color: "#1e293b", letterSpacing: "0.14em" }}>AUCUN TRADE CHARGÉ</div>}
      </div>
    </div>
  );
}


