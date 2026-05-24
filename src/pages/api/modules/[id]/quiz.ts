import type { APIRoute } from "astro";
import { z } from "zod";
import {
  getQuizQuestions,
  upsertQuizQuestion,
} from "../../../../lib/store-admin";
import { getSupabase } from "../../../../lib/supabase";

const questionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(3, "Question trop courte").max(500),
  options: z.array(z.string().min(1).max(300)).min(2, "Au moins 2 options").max(8, "Maximum 8 options"),
  correcte: z.number().int().min(0),
});

const putSchema = z.object({
  questions: z.array(questionSchema).max(50),
});

export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const moduleId = params.id;
  if (!moduleId) return new Response(JSON.stringify({ error: "ID requis" }), { status: 400 });

  const questions = await getQuizQuestions(moduleId);
  return new Response(JSON.stringify({ moduleId, questions }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

/**
 * Remplace l'intégralité du quiz d'un module : on supprime tout puis on réinsère.
 * Plus simple côté UI (on envoie le tableau complet à chaque édition).
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const moduleId = params.id;
  if (!moduleId) return new Response(JSON.stringify({ error: "ID requis" }), { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), { status: 400 });
  }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), { status: 400 });
  }

  for (const q of parsed.data.questions) {
    if (q.correcte >= q.options.length) {
      return new Response(
        JSON.stringify({ error: `Réponse correcte hors plage pour : « ${q.question.slice(0, 40)}… »` }),
        { status: 400 }
      );
    }
  }

  const supa = getSupabase();
  await supa.from("quiz_questions").delete().eq("module_id", moduleId);

  for (const [index, q] of parsed.data.questions.entries()) {
    await upsertQuizQuestion({
      moduleId,
      question: q.question,
      options: q.options,
      correcte: q.correcte,
    });
    // bumper l'ordre pour respecter la sortie ordonnée
    await supa
      .from("quiz_questions")
      .update({ ordre: index })
      .eq("module_id", moduleId)
      .eq("question", q.question);
  }

  const fresh = await getQuizQuestions(moduleId);
  return new Response(JSON.stringify({ moduleId, questions: fresh }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
