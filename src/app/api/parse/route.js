import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a financial trade confirmation parser. Extract structured data from PDF trade confirmations from brokers MAKOR and TRADITION (TSAF).

For MAKOR confirmations:
- broker: "MAKOR"
- sens: If document contains "BOUGHT" → "Achat", if "SOLD" → "Vente"
- security: the value after "Security Name:"
- isin: the value after "ISIN:"
- quantity: the number after "Quantity:" (as a number, no commas)
- tradeDate: after "Trade Date:"
- settlementDate: after "Settlement Date:"
- totalValue: after "Total Trade Value:" (keep currency and formatting)
- prixUnitaire: compute as Total Trade Value numeric amount / Quantity, rounded to 6 decimals

For TRADITION (TSAF) confirmations:
- broker: "TRADITION"
- sens: If document contains "WE HAVE SOLD TO YOU" → "Achat", if "WE HAVE BOUGHT FROM YOU" → "Vente"
- security: the value after "SECURITY:"
- isin: the value after "ISIN CODE:"
- quantity: the number after "NOMINAL:" (as a number, no commas)
- tradeDate: after "TRADE DATE:"
- settlementDate: after "SETTLEMENT DATE:"
- totalValue: after "TOTAL CONSIDERATION:" (keep currency and formatting)
- prixUnitaire: compute as Total Consideration numeric amount / Nominal, rounded to 6 decimals

Return ONLY a valid JSON array. No markdown, no explanation, no code fences.
Each object must have exactly these keys: broker, sens, security, isin, quantity, tradeDate, settlementDate, totalValue, prixUnitaire`;

export async function POST(request) {
  try {
    const { pdfBase64 } = await request.json();
    if (!pdfBase64) {
      return Response.json({ error: "Aucun PDF fourni" }, { status: 400 });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      SYSTEM_PROMPT,
      { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
      "Parse this trade confirmation and return a JSON array only.",
    ]);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    const trades = JSON.parse(clean);
    return Response.json({ trades: Array.isArray(trades) ? trades : [trades] });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
