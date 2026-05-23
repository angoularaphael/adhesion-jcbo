/**
 * Seed quiz_questions depuis les modules M01–M27.
 * Usage: node scripts/seed-quiz.mjs
 * Requiert: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY dans .env (charger via dotenv manuel ou export)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const quizData = JSON.parse(readFileSync(join(__dirname, "quiz-seed.json"), "utf8"));

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

for (const [moduleId, questions] of Object.entries(quizData)) {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await supabase.from("quiz_questions").upsert({
      id: `${moduleId}-${q.id}`,
      module_id: moduleId,
      question: q.question,
      options: q.options,
      correcte: q.correcte,
      ordre: i,
    });
  }
  console.log(`✓ ${moduleId}: ${questions.length} questions`);
}
console.log("Terminé.");
