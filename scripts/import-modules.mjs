/**
 * Importe les Module_*.md racine vers contenu_md des modules Supabase.
 * Usage: node scripts/import-modules.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis");
  process.exit(1);
}

const supabase = createClient(url, key);

const mapping = [
  { file: "Module_1_Clarifier_sa_vision_et_sa_mission_entrepreneuriale.md", moduleId: "M01" },
  { file: "Module_2_Clarifier_son_projet_et_sa_proposition_de_valeur.md", moduleId: "M03" },
  { file: "Module_3_Developper_la_confiance_et_le_leadership_entrepreneurial.md", moduleId: "M02" },
  { file: "Module_4_Discipline_Resilience_et_Performance_Entrepreneuriale.md", moduleId: "M05" },
  { file: "Module_5_Productivite_et_Efficacite_Entrepreneuriale.md", moduleId: "M04" },
  { file: "Module_6_Communication_et_Influence_Entrepreneuriale.md", moduleId: "M07" },
  { file: "Module_7_Strategie_et_Passage_a_l_Action.md", moduleId: "M06" },
  { file: "Module_8_Confiance_Numerique_et_Credibilite_Entrepreneuriale.md", moduleId: "M07" },
  { file: "Module_9_Structurer_sa_Croissance_et_Assurer_la_Perennite_de_son_Entreprise.md", moduleId: "M26" },
];

for (const { file, moduleId } of mapping) {
  try {
    const md = readFileSync(join(root, file), "utf8");
    await supabase.from("modules").update({ contenu_md: md }).eq("id", moduleId);
    console.log(`✓ ${moduleId} ← ${file}`);
  } catch (e) {
    console.warn(`⚠ ${file}:`, e.message);
  }
}
console.log("Import terminé.");
