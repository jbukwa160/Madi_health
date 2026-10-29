import "server-only";
import { randomInt } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { dataDir } from "./data-dir";
import { transport } from "./orders";
import { SITE } from "./site";

// Questions to the pharmacist from /konsultatsia. Saved to DATA_DIR/consultations.jsonl and e-mailed to the shop
// (SHOP_EMAIL) when SMTP is set; the pharmacist answers by phone or e-mail.

export const TOPICS = [
  { id: "produkt", label: "Избор на продукт" },
  { id: "lekarstvo", label: "Лекарство без рецепта" },
  { id: "dobavki", label: "Хранителни добавки" },
  { id: "bebe", label: "Бебе и бременност" },
  { id: "kozha", label: "Кожа и дермокозметика" },
  { id: "drugo", label: "Друго" },
] as const;

const PHONE = /^\+?[\d\s()-]{8,20}$/;

export function consultationSchema() {
  return z
    .object({
      name: z.string().trim().min(2, "Напишете името си.").max(80),
      phone: z.string().trim().max(24).optional().default(""),
      email: z.string().trim().max(120).optional().default(""),
      topic: z.enum(TOPICS.map((t) => t.id) as [string, ...string[]], "Изберете тема."),
      question: z.string().trim().min(10, "Опишете въпроса си в няколко думи.").max(2000),
      consent: z.literal(true, "Нужно е съгласието ви, за да ви отговорим."),
      /** Honeypot: people never see it, bots fill it in. */
      website: z.string().max(0).optional().default(""),
    })
    .superRefine((v, ctx) => {
      const phone = v.phone.replace(/\s/g, "");
      if (!phone && !v.email) ctx.addIssue({ code: "custom", path: ["phone"], message: "Оставете телефон или имейл, за да ви отговорим." });
      if (phone && !PHONE.test(v.phone)) ctx.addIssue({ code: "custom", path: ["phone"], message: "Проверете телефонния номер." });
      if (v.email && !z.email().safeParse(v.email).success) ctx.addIssue({ code: "custom", path: ["email"], message: "Проверете имейла." });
    });
}

export type ConsultationInput = z.output<ReturnType<typeof consultationSchema>>;

export type Consultation = Omit<ConsultationInput, "website" | "consent"> & { number: string; createdAt: string; topicLabel: string };

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function buildConsultation(input: ConsultationInput): Consultation {
  let tail = "";
  for (let i = 0; i < 5; i++) tail += ALPHABET[randomInt(ALPHABET.length)];
  return {
    number: `K-${tail}`,
    createdAt: new Date().toISOString(),
    name: input.name,
    phone: input.phone,
    email: input.email,
    topic: input.topic,
    topicLabel: TOPICS.find((t) => t.id === input.topic)?.label ?? input.topic,
    question: input.question,
  };
}

const file = () => path.join(dataDir(), "consultations.jsonl");

export async function saveConsultation(c: Consultation): Promise<void> {
  await mkdir(dataDir(), { recursive: true });
  await appendFile(file(), JSON.stringify(c) + "\n", "utf8");
}

const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

export async function mailConsultation(c: Consultation): Promise<void> {
  const tr = transport();
  if (!tr) {
    console.warn(`[konsultatsia] ${c.number}: SMTP is not configured, the question is only in ${file()}`);
    return;
  }
  const lines = [`Име: ${c.name}`, `Телефон: ${c.phone || "—"}`, `Имейл: ${c.email || "—"}`, `Тема: ${c.topicLabel}`];
  try {
    await tr.sendMail({
      from: process.env.MAIL_FROM || `${SITE.name} <${SITE.email}>`,
      to: process.env.SHOP_EMAIL || SITE.email,
      replyTo: c.email || undefined,
      subject: `Въпрос към фармацевт ${c.number} — ${c.topicLabel}`,
      text: `${lines.join("\n")}\n\n${c.question}\n\nОбещали сме отговор до 1 час в работното време на аптеката.`,
      html: `<div style="font:15px/1.6 Arial,sans-serif;color:#10153a;max-width:560px"><p>${lines.map(esc).join("<br>")}</p><p style="white-space:pre-wrap;border-left:3px solid #03caa4;padding-left:12px">${esc(c.question)}</p><p style="color:#5f6684;font-size:13px">Обещали сме отговор до 1 час в работното време на аптеката.</p></div>`,
    });
  } catch (err) {
    console.error(`[konsultatsia] ${c.number}: could not send the e-mail`, err);
  }
}

const hits = new Map<string, number[]>();

/** At most 5 questions per IP in 15 minutes. */
export function tooManyQuestions(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 15 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < 15 * 60 * 1000)) hits.delete(k);
  return list.length > 5;
}
