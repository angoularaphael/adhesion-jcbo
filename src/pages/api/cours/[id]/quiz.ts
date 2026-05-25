import type { APIRoute } from "astro";
import { z } from "zod";
import {
  getQuizQuestionsFinal,
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
  const coursId = params.id;
  if (!coursId) return new Response(JSON.stringify({ error: "ID requis" }), { status: 400 });

  const questions = await getQuizQuestionsFinal(coursId);
  return new Response(JSON.stringify({ coursId, questions }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

/** Remplace l'intégralité du quiz final d'un cours. */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.session || locals.session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }
  const coursId = params.id;
  if (!coursId) return new Response(JSON.stringify({ error: "ID requis" }), { status: 400 });

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
  await supa.from("quiz_questions").delete().eq("cours_id", coursId).is("module_id", null);

  for (const [index, q] of parsed.data.questions.entries()) {
    await upsertQuizQuestion({
      coursId,
      moduleId: null,
      question: q.question,
      options: q.options,
      correcte: q.correcte,
    });
    await supa
      .from("quiz_questions")
      .update({ ordre: index })
      .eq("cours_id", coursId)
      .is("module_id", null)
      .eq("question", q.question);
  }

  const fresh = await getQuizQuestionsFinal(coursId);
  return new Response(JSON.stringify({ coursId, questions: fresh }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
