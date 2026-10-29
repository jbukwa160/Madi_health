import { after, NextResponse, type NextRequest } from "next/server";
import { buildConsultation, consultationSchema, mailConsultation, saveConsultation, tooManyQuestions } from "@/lib/consultations";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 });
  }
  if (tooManyQuestions(ip)) return NextResponse.json({ error: "Изпратихте много въпроси за кратко време. Опитайте отново след малко или ни се обадете." }, { status: 429 });

  const parsed = consultationSchema().safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0] ?? "form")] ??= issue.message;
    // A filled honeypot means a bot: answer like a success so it does not retry, but save nothing.
    if (fields.website) return NextResponse.json({ number: "K-00000" });
    return NextResponse.json({ error: "Проверете маркираните полета.", fields }, { status: 422 });
  }
  try {
    const c = buildConsultation(parsed.data);
    await saveConsultation(c);
    after(() => mailConsultation(c));
    return NextResponse.json({ number: c.number });
  } catch (err) {
    console.error("[konsultatsia] could not save", err);
    return NextResponse.json({ error: "Въпросът не беше изпратен. Моля, обадете ни се по телефона." }, { status: 500 });
  }
}
