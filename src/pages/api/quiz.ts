import type { APIRoute } from "astro";
import { z } from "zod";
import { getQuizQuestionsFinal, QUIZ_FINAL_MODULE_ID } from "../../lib/store-admin";
import { enregistrerQuizResultat, getProgressions } from "../../lib/store";

const schema = z.object({
  coursId: z.string().min(1),
  moduleId: z.string().min(1),
  reponses: z.array(z.number().int().min(0)),
});

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error.issues[0].message }), { status: 400 });
  }

  const { coursId, moduleId, reponses } = result.data;

  if (moduleId !== QUIZ_FINAL_MODULE_ID) {
    return new Response(JSON.stringify({ error: "Seul le quiz final est disponible." }), { status: 400 });
  }

  const progressions = await getProgressions(locals.session.email);
  const prog = progressions.find(p => p.coursId === coursId);
  if (!prog) {
    return new Response(JSON.stringify({ error: "Progression introuvable." }), { status: 404 });
  }

  const { getCours } = await import("../../lib/store");
  const cours = (await getCours()).find(c => c.id === coursId);
  const totalModules = cours?.modules.length ?? 0;
  if (totalModules > 0 && (prog.modulesTermines?.length ?? 0) < totalModules) {
    return new Response(
      JSON.stringify({ error: "Terminez tous les modules avant de passer le quiz final." }),
      { status: 403 }
    );
  }

  const existingQuizResult = prog.quizResultats?.find(q => q.moduleId === QUIZ_FINAL_MODULE_ID);
  if (existingQuizResult && existingQuizResult.passe && existingQuizResult.score >= 80) {
    return new Response(
      JSON.stringify({ error: "Quiz final déjà validé. Vous ne pouvez plus le refaire.", score: existingQuizResult.score, passe: true }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const questions = await getQuizQuestionsFinal(coursId);

  if (!questions.length) {
    return new Response(JSON.stringify({ error: "Quiz final introuvable pour ce cours." }), { status: 404 });
  }

  let bonnes = 0;
  const details = questions.map((q, i) => {
    const correct = reponses[i] === q.correcte;
    if (correct) bonnes++;
    return { questionId: q.id, correct, correcte: q.correcte, donnee: reponses[i] ?? -1 };
  });

  const score = Math.round((bonnes / questions.length) * 100);
  const passe = score >= 80;

  const progression = await enregistrerQuizResultat(
    locals.session.email,
    coursId,
    QUIZ_FINAL_MODULE_ID,
    score,
    passe
  );

  return new Response(
    JSON.stringify({ score, passe, bonnes, total: questions.length, details, progression }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

export const GET: APIRoute = async ({ url, locals }) => {
  if (!locals.session || locals.session.role !== "adherent") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const coursId = url.searchParams.get("coursId");
  const isFinal = url.searchParams.get("final") === "true";
  if (!coursId || !isFinal) {
    return new Response(JSON.stringify({ error: "coursId et final=true requis" }), { status: 400 });
  }
  const questions = (await getQuizQuestionsFinal(coursId)).map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }));
  return new Response(JSON.stringify({ coursId, questions }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
