"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { IconCheck } from "@/components/Icons";

type Topic = { id: string; label: string };
type Errors = Record<string, string>;

/** The question to the pharmacist. Sent to /api/konsultatsia; the answer comes by phone or e-mail. */
export function ConsultForm({ topics }: { topics: readonly Topic[] }) {
  const [topic, setTopic] = useState(topics[0].id);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const data = new FormData(e.currentTarget);
    const body = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      topic,
      question: String(data.get("question") ?? ""),
      consent: data.get("consent") === "on",
      website: String(data.get("website") ?? ""),
    };
    setSending(true);
    setFormError("");
    try {
      const res = await fetch("/api/konsultatsia", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const json = (await res.json().catch(() => ({}))) as { number?: string; error?: string; fields?: Errors };
      if (res.ok && json.number) {
        setErrors({});
        setDone(json.number);
        return;
      }
      setErrors(json.fields ?? {});
      setFormError(json.error ?? "Въпросът не беше изпратен. Опитайте отново.");
      // Take keyboard and screen-reader users to the first field that needs attention.
      const first = Object.keys(json.fields ?? {})[0];
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
    } catch {
      setFormError("Няма връзка. Проверете интернета или ни се обадете по телефона.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="anim-rise rounded-2xl border border-mint/40 bg-mint-soft p-6 sm:p-8" role="status">
        <span className="grid size-12 place-items-center rounded-full bg-mint-deep text-white">
          <IconCheck size={24} />
        </span>
        <h2 className="mt-4 text-[1.375rem]">Въпросът е изпратен</h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">
          Номер на запитването: <strong className="num text-ink">{done}</strong>. Магистър-фармацевт ще ви отговори до 1 час в работното време на
          аптеката — по телефона или на имейла, който оставихте.
        </p>
        <Link href="/" className="btn btn-line mt-6">
          Към началната страница
        </Link>
      </div>
    );
  }

  const field = (name: string) => ({ name, "aria-invalid": errors[name] ? true : undefined, "aria-describedby": errors[name] ? `${name}-error` : undefined });

  return (
    <form ref={form} onSubmit={submit} noValidate className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="field sm:col-span-2">
          <span className="field-label">Име</span>
          <input className="input" autoComplete="name" maxLength={80} {...field("name")} />
          {errors.name ? <span id="name-error" className="field-error">{errors.name}</span> : null}
        </label>
        <label className="field">
          <span className="field-label">Телефон</span>
          <input className="input" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} {...field("phone")} />
          {errors.phone ? <span id="phone-error" className="field-error">{errors.phone}</span> : null}
        </label>
        <label className="field">
          <span className="field-label">Имейл</span>
          <input className="input" type="email" autoComplete="email" maxLength={120} {...field("email")} />
          {errors.email ? <span id="email-error" className="field-error">{errors.email}</span> : null}
        </label>
      </div>
      <p className="-mt-2 text-[0.8125rem] text-ink-3">Достатъчно е едно от двете — телефон или имейл.</p>

      <fieldset>
        <legend className="field-label mb-2">За какво е въпросът?</legend>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button key={t.id} type="button" aria-pressed={topic === t.id} onClick={() => setTopic(t.id)} className="chip">
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span className="field-label">Вашият въпрос</span>
        <textarea
          className="input min-h-36"
          maxLength={2000}
          placeholder="Например: какво е подходящо за 4-годишно дете при суха кашлица? Приема ли се заедно с…"
          {...field("question")}
        />
        {errors.question ? <span id="question-error" className="field-error">{errors.question}</span> : null}
      </label>

      {/* Honeypot: hidden from people and from screen readers. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] size-px opacity-0" />

      <label className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-ink-2">
        <input type="checkbox" className="check mt-0.5" {...field("consent")} />
        <span>
          Съгласен/на съм данните ми да бъдат използвани, за да получа отговор, съгласно{" "}
          <Link href="/info/poveritelnost" className="underline decoration-line-strong underline-offset-2 hover:decoration-mint-deep">
            Политиката за поверителност
          </Link>
          .
        </span>
      </label>
      {errors.consent ? <p id="consent-error" className="field-error -mt-3">{errors.consent}</p> : null}

      {formError ? (
        <p role="alert" className="rounded-lg bg-blush px-4 py-3 text-[0.875rem] text-danger">
          {formError}
        </p>
      ) : null}

      <button type="submit" className="btn btn-ink w-full sm:w-auto" disabled={sending} aria-busy={sending}>
        {/* The label crossfades with a light blur instead of jumping. */}
        <span className={`transition-[opacity,filter] duration-200 ${sending ? "opacity-70 blur-[1px]" : ""}`}>{sending ? "Изпращане…" : "Изпрати въпроса"}</span>
      </button>
    </form>
  );
}
