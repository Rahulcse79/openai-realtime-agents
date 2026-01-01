import hotelTaj from "../src/app/hardCodeData/hotelManagment/hotelTaj.json" assert { type: "json" };

function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .replace(/[\u2019']/g, "'")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTextUnicode(text) {
  return String(text)
    .toLowerCase()
    .replace(/[\u2019']/g, "'")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectService(text) {
  const tAscii = normalizeText(text);
  const t = normalizeTextUnicode(text);

  const hints = hotelTaj?.aiMlLayer?.knowledgeBase?.intentRoutingHints;
  if (hints && typeof hints === "object") {
    for (const [phrase, serviceId] of Object.entries(hints)) {
      if (typeof phrase !== "string" || typeof serviceId !== "string") continue;
      const p = normalizeText(phrase);
      if (!p) continue;
      if (t.includes(p) || tAscii.includes(p)) return serviceId;
    }
  }

  if (
    t.includes("साफ") ||
    t.includes("सफाई") ||
    t.includes("रूम साफ") ||
    t.includes("कमरा साफ") ||
    t.includes("हाउसकीपिंग") ||
    t.includes("کمرہ صاف") ||
    t.includes("صفائی")
  ) {
    return "HK-CLEANING";
  }

  if (
    t.includes("वाईफाई") ||
    t.includes("वाइफाइ") ||
    t.includes("wifi") ||
    t.includes("इंटरनेट") ||
    t.includes("नहीं चल") ||
    t.includes("کا م نہیں") ||
    t.includes("وائی فائی") ||
    t.includes("انٹرنیٹ")
  ) {
    return "MS-WIFI";
  }

  return null;
}

const cases = [
  { text: "मुझे रूम साफ कराना है", expect: "HK-CLEANING" },
  { text: "मेरा वाईफाई नहीं चल रहा है, जल्दी से ठीक करा दो", expect: "MS-WIFI" },
  { text: "wifi not working", expect: "MS-WIFI" },
  { text: "room cleaning", expect: "HK-CLEANING" },
];

let failed = 0;
for (const c of cases) {
  const got = detectService(c.text);
  const ok = got === c.expect;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${c.expect} | got=${got} | ${c.text}`);
}

if (failed) process.exit(1);
