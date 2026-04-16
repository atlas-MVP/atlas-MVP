// Site-wide conflict side colors and country-to-side mapping
// Blue = western / allied, Red = eastern / adversary

export const SIDE_COLORS = {
  blue:    { fill: "#0d2a52", pulse: "#2563eb", dot: "#2563eb" },
  red:     { fill: "#3b0f1f", pulse: "#991b1b", dot: "#991b1b" },
  neutral: { fill: "#0d2a52", pulse: "#ef4444", dot: "rgba(255,255,255,0.22)" },
} as const;

// ISO → side mapping (global default — blue western, red eastern)
export const COUNTRY_SIDE: Record<string, "blue" | "red"> = {
  // Western / Allied
  ISR: "blue", USA: "blue", GBR: "blue", FRA: "blue",
  ARE: "blue", KWT: "blue", QAT: "blue", JOR: "blue",
  UKR: "blue", TWN: "blue", LKA: "blue",
  // Eastern / Adversary
  IRN: "red", LBN: "red", PSE: "red", SYR: "red",
  IRQ: "red", RUS: "red", CHN: "red", YEM: "red",
};

// Name → side lookup for casualty rows (uses conflict.sides if available, falls back to COUNTRY_SIDE via ISO)
export function getCountrySide(
  countryName: string,
  sides?: { blue: string[]; red: string[] },
): "blue" | "red" | "neutral" {
  if (sides) {
    if (sides.blue.includes(countryName)) return "blue";
    if (sides.red.includes(countryName)) return "red";
  }
  return "neutral";
}
