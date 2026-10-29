import { Onest } from "next/font/google";

// One family for everything: Onest is a calm grotesque with full Cyrillic. Headings use its heavier weights.
export const sans = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--nf-sans",
  display: "swap",
});

export const fontVariables = sans.variable;
