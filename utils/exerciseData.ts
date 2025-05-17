import { ensureError } from "./methods";
import { db } from "./sqliteHelper";
import uuid from "react-native-uuid";

/**
 * Generate a simple UUID
 * This is a basic implementation for our needs
 */
function generateUUID() {
  // return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
  //   const r = (Math.random() * 16) | 0;
  //   const v = c === "x" ? r : (r & 0x3) | 0x8;
  //   return v.toString(16);
  // });
  return uuid.v4();
}

/**
 * Seed exercise data into the database if it doesn't already exist.
 * This function checks if there are any exercises in the database,
 * and if not, inserts the predefined exercise data.
 */
export async function seedExerciseData() {
  try {
    // Check if data already exists
    const existingExercises = await db.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM exercises"
    );

    if (existingExercises[0].count === 0) {
      console.log("Seeding exercise data...");

      // Create a map to store exercise IDs by slug for later reference
      const exerciseIds = new Map();

      // Define exercise data
      const exercises = [
        // -------------------- Tlakové cviky --------------------------
        {
          name: "Bench Press",
          slug: "bench-press",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.0,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Flat barbell press for chest",
        },
        {
          name: "Incline Bench Press",
          slug: "incline-bench-press",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.0,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Barbell press on 30-45° incline bench",
        },
        {
          name: "Decline Bench Press",
          slug: "decline-bench-press",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.0,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Barbell press on declined bench",
        },
        {
          name: "Overhead Press",
          slug: "overhead-press",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.0,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Standing shoulder press",
        },
        {
          name: "Push Press",
          slug: "push-press",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.0,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Assisted leg drive overhead press",
        },
        {
          name: "Dumbbell Shoulder Press",
          slug: "dumbbell-shoulder-press",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.8,
          kcal_per_kg_rep: 0.1,
          equipment: "dumbbell",
          description: "Seated/standing dumbbell press",
        },
        {
          name: "Dips",
          slug: "dips",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.5,
          kcal_per_kg_rep: 0.09,
          equipment: "bodyweight",
          description: "Parallel-bar dips for chest/triceps",
        },
        // -------------------- Tahové cviky ---------------------------
        {
          name: "Barbell Row",
          slug: "barbell-row",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.0,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Bent-over row",
        },
        {
          name: "Pendlay Row",
          slug: "pendlay-row",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.0,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Strict row from floor each rep",
        },
        {
          name: "T-Bar Row",
          slug: "t-bar-row",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.8,
          kcal_per_kg_rep: 0.1,
          equipment: "machine",
          description: "Chest-supported T-bar row",
        },
        {
          name: "Dumbbell Row",
          slug: "dumbbell-row",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.8,
          kcal_per_kg_rep: 0.1,
          equipment: "dumbbell",
          description: "Single-arm row on bench",
        },
        {
          name: "Seated Cable Row",
          slug: "seated-cable-row",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.5,
          kcal_per_kg_rep: 0.1,
          equipment: "cable",
          description: "Horizontal cable row",
        },
        {
          name: "Lat Pulldown",
          slug: "lat-pulldown",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.5,
          kcal_per_kg_rep: 0.1,
          equipment: "cable",
          description: "Wide-grip pulldown",
        },
        {
          name: "Pull-Up",
          slug: "pull-up",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.8,
          kcal_per_kg_rep: 0.09,
          equipment: "bodyweight",
          description: "Pronated-grip pull-up",
        },
        {
          name: "Chin-Up",
          slug: "chin-up",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.8,
          kcal_per_kg_rep: 0.09,
          equipment: "bodyweight",
          description: "Supinated-grip pull-up",
        },
        // -------------------- Dřepové / kyčelní cviky ----------------
        {
          name: "Back Squat",
          slug: "back-squat",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.0,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "High-/low-bar barbell squat",
        },
        {
          name: "Front Squat",
          slug: "front-squat",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.0,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Barbell front-rack squat",
        },
        {
          name: "Goblet Squat",
          slug: "goblet-squat",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.8,
          kcal_per_kg_rep: 0.1,
          equipment: "dumbbell",
          description: "Squat holding dumbbell/kettlebell",
        },
        {
          name: "Bulgarian Split Squat",
          slug: "bulgarian-split-squat",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.8,
          kcal_per_kg_rep: 0.1,
          equipment: "dumbbell",
          description: "Rear-foot-elevated split squat",
        },
        {
          name: "Lunge",
          slug: "lunge",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.8,
          kcal_per_kg_rep: 0.1,
          equipment: "dumbbell",
          description: "Alternating walking lunge",
        },
        {
          name: "Step-Up",
          slug: "step-up",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.5,
          kcal_per_kg_rep: 0.1,
          equipment: "dumbbell",
          description: "Dumbbell step-up on box",
        },
        {
          name: "Leg Press",
          slug: "leg-press",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.5,
          kcal_per_kg_rep: 0.1,
          equipment: "machine",
          description: "45° sled leg press",
        },
        // -------------------- Kyčlové tahy ---------------------------
        {
          name: "Deadlift",
          slug: "deadlift",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.2,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Conventional barbell deadlift",
        },
        {
          name: "Sumo Deadlift",
          slug: "sumo-deadlift",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.2,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Wide-stance deadlift",
        },
        {
          name: "Romanian Deadlift",
          slug: "romanian-deadlift",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 6.0,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Hip-hinge RDL",
        },
        {
          name: "Hip Thrust",
          slug: "hip-thrust",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.8,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Barbell hip thrust",
        },
        {
          name: "Glute Bridge",
          slug: "glute-bridge",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.5,
          kcal_per_kg_rep: 0.09,
          equipment: "bodyweight",
          description: "Body-weight or loaded bridge",
        },
        {
          name: "Kettlebell Swing",
          slug: "kettlebell-swing",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.8,
          kcal_per_kg_rep: 0.1,
          equipment: "kettlebell",
          description: "Hip-hinge kettlebell swing",
        },
        // -------------------- Paže a ramena --------------------------
        {
          name: "Barbell Biceps Curl",
          slug: "barbell-biceps-curl",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.2,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Standing barbell curl",
        },
        {
          name: "Dumbbell Hammer Curl",
          slug: "dumbbell-hammer-curl",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.2,
          kcal_per_kg_rep: 0.1,
          equipment: "dumbbell",
          description: "Neutral-grip curl",
        },
        {
          name: "Triceps Pushdown",
          slug: "triceps-pushdown",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.2,
          kcal_per_kg_rep: 0.1,
          equipment: "cable",
          description: "Cable rope pushdown",
        },
        {
          name: "Skull Crusher",
          slug: "skull-crusher",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.5,
          kcal_per_kg_rep: 0.1,
          equipment: "barbell",
          description: "Lying EZ-bar triceps extension",
        },
        {
          name: "Lateral Raise",
          slug: "lateral-raise",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.0,
          kcal_per_kg_rep: 0.1,
          equipment: "dumbbell",
          description: "Dumbbell side raise",
        },
        {
          name: "Face Pull",
          slug: "face-pull",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.0,
          kcal_per_kg_rep: 0.1,
          equipment: "cable",
          description: "High-rope external-rotation pull",
        },
        // -------------------- Hrudník (doplňky) ----------------------
        {
          name: "Incline Dumbbell Press",
          slug: "incline-dumbbell-press",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.8,
          kcal_per_kg_rep: 0.1,
          equipment: "dumbbell",
          description: "Incline bench dumbbell press",
        },
        {
          name: "Dumbbell Fly",
          slug: "dumbbell-fly",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.5,
          kcal_per_kg_rep: 0.1,
          equipment: "dumbbell",
          description: "Flat bench fly",
        },
        {
          name: "Cable Crossover",
          slug: "cable-crossover",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.5,
          kcal_per_kg_rep: 0.1,
          equipment: "cable",
          description: "Standing cable fly",
        },
        // -------------------- Lýtka & core ---------------------------
        {
          name: "Standing Calf Raise",
          slug: "standing-calf-raise",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.0,
          kcal_per_kg_rep: 0.1,
          equipment: "machine",
          description: "Smith-/machine calf raise",
        },
        {
          name: "Hanging Leg Raise",
          slug: "hanging-leg-raise",
          modality: "strength",
          tracking_mode: "reps_weight",
          met: 5.2,
          kcal_per_kg_rep: 0.09,
          equipment: "bodyweight",
          description: "Core exercise hanging from bar",
        },
      ];

      // Insert exercises one by one and store their IDs
      for (const exercise of exercises) {
        const id = generateUUID();
        exerciseIds.set(exercise.slug, id);

        await db.runAsync(
          `INSERT INTO exercises (id, name, slug, modality, tracking_mode, met, kcal_per_kg_rep, equipment, description) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            exercise.name,
            exercise.slug,
            exercise.modality,
            exercise.tracking_mode,
            exercise.met,
            exercise.kcal_per_kg_rep,
            exercise.equipment,
            exercise.description,
          ]
        );
      }

      // Define Czech localizations
      const czechLocalizations = [
        // ------------- tlakové cviky -----------------------------------
        {
          slug: "bench-press",
          locale: "cs",
          name: "Bench press",
          description: "Tlaky na rovné lavici s velkou činkou.",
        },
        {
          slug: "incline-bench-press",
          locale: "cs",
          name: "Incline bench press",
          description: "Tlaky na šikmé lavici (30–45°) s velkou činkou.",
        },
        {
          slug: "decline-bench-press",
          locale: "cs",
          name: "Decline bench press",
          description: "Tlaky na mírně záporně skloněné lavici.",
        },
        {
          slug: "overhead-press",
          locale: "cs",
          name: "Tlak nad hlavu",
          description: "Stojný tlak činky nad hlavu.",
        },
        {
          slug: "push-press",
          locale: "cs",
          name: "Push press",
          description: "Tlak nad hlavu s dopomocí nohou.",
        },
        {
          slug: "dumbbell-shoulder-press",
          locale: "cs",
          name: "Tlak s jednoručkami nad hlavu",
          description: "Seated/standing press s jednoručkami.",
        },
        {
          slug: "dips",
          locale: "cs",
          name: "Dipy na bradlech",
          description: "Tricepsové kliky na bradlech.",
        },
        // ------------- tahové cviky ------------------------------------
        {
          slug: "barbell-row",
          locale: "cs",
          name: "Přítahy činky v předklonu",
          description: "Bent-over row.",
        },
        {
          slug: "pendlay-row",
          locale: "cs",
          name: "Pendlay row",
          description: "Striktní přítahy činky z podlahy.",
        },
        {
          slug: "t-bar-row",
          locale: "cs",
          name: "T-bar row",
          description: "Přítahy na T-bar stroji.",
        },
        {
          slug: "dumbbell-row",
          locale: "cs",
          name: "Jednoruční přítahy",
          description: "Přítahy jednoručky opřené o lavici.",
        },
        {
          slug: "seated-cable-row",
          locale: "cs",
          name: "Veslování na spodní kladce",
          description: "Horizontal row v sedě.",
        },
        {
          slug: "lat-pulldown",
          locale: "cs",
          name: "Stahování horní kladky",
          description: "Široký úchop nad hmatem.",
        },
        {
          slug: "pull-up",
          locale: "cs",
          name: "Shyby nadhmatem",
          description: "Shyby na hrazdě s nadhmatem.",
        },
        {
          slug: "chin-up",
          locale: "cs",
          name: "Shyby podhmatem",
          description: "Shyby na hrazdě s podhmatem.",
        },
        // ------------- dřepy a kvadricepsy ------------------------------
        {
          slug: "back-squat",
          locale: "cs",
          name: "Dřep s činkou na zádech",
          description: "Klasický back squat (high/low-bar).",
        },
        {
          slug: "front-squat",
          locale: "cs",
          name: "Přední dřep",
          description: "Front squat s činkou vpředu.",
        },
        {
          slug: "goblet-squat",
          locale: "cs",
          name: "Goblet dřep",
          description: "Dřep s jednoručkou/kettlebellem u hrudi.",
        },
        {
          slug: "bulgarian-split-squat",
          locale: "cs",
          name: "Bulharský dřep",
          description: "Zadní noha na lavičce, jednoručky v rukou.",
        },
        { slug: "lunge", locale: "cs", name: "Výpady", description: "Chůze/výpad s jednoručkami." },
        {
          slug: "step-up",
          locale: "cs",
          name: "Výstupy na bednu",
          description: "Step-up na bednu s jednoručkami.",
        },
        {
          slug: "leg-press",
          locale: "cs",
          name: "Leg press",
          description: "Tlak nohama na 45° stroji.",
        },
        // ------------- kyčlové tahy ------------------------------------
        {
          slug: "deadlift",
          locale: "cs",
          name: "Mrtvý tah",
          description: "Konvenční tah z podlahy.",
        },
        {
          slug: "sumo-deadlift",
          locale: "cs",
          name: "Sumo mrtvý tah",
          description: "Široký sumo postoj.",
        },
        {
          slug: "romanian-deadlift",
          locale: "cs",
          name: "Rumunský mrtvý tah",
          description: "Hip-hinge RDL se sníženým ohybem kolen.",
        },
        {
          slug: "hip-thrust",
          locale: "cs",
          name: "Hip thrust",
          description: "Výpony boků s činkou opřenou o lavičku.",
        },
        {
          slug: "glute-bridge",
          locale: "cs",
          name: "Glute bridge",
          description: "Most na zemi – tělesná váha nebo zátěž.",
        },
        {
          slug: "kettlebell-swing",
          locale: "cs",
          name: "Kettlebell swing",
          description: "Kyčlový švih s kettlebellem.",
        },
        // ------------- paže & ramena -----------------------------------
        {
          slug: "barbell-biceps-curl",
          locale: "cs",
          name: "Bicepsový zdvih s velkou činkou",
          description: "Standing barbell curl.",
        },
        {
          slug: "dumbbell-hammer-curl",
          locale: "cs",
          name: "Hammer curl s jednoručkami",
          description: 'Neutrální úchop „kladiva".',
        },
        {
          slug: "triceps-pushdown",
          locale: "cs",
          name: "Triceps pushdown",
          description: "Stlačování horní kladky.",
        },
        {
          slug: "skull-crusher",
          locale: "cs",
          name: "Skull crusher",
          description: "Leh-sed tricepsová extenze s EZ-osou.",
        },
        {
          slug: "lateral-raise",
          locale: "cs",
          name: "Upažování s jednoručkami",
          description: "Dumbbell lateral raise.",
        },
        {
          slug: "face-pull",
          locale: "cs",
          name: "Face pull",
          description: "Externo-rotační tah horní kladky k obličeji.",
        },
        // ------------- hrudník (doplňky) --------------------------------
        {
          slug: "incline-dumbbell-press",
          locale: "cs",
          name: "Incline tlak s jednoručkami",
          description: "Tlaky s jednoručkami na šikmé lavici.",
        },
        {
          slug: "dumbbell-fly",
          locale: "cs",
          name: "Rozpažky s jednoručkami",
          description: "Dumbbell fly na rovné lavici.",
        },
        {
          slug: "cable-crossover",
          locale: "cs",
          name: "Křížení kladek",
          description: "Cable crossover pro hrudník.",
        },
        // ------------- lýtka & core -------------------------------------
        {
          slug: "standing-calf-raise",
          locale: "cs",
          name: "Výpony ve stoje",
          description: "Standing calf raise – stroj/Smith.",
        },
        {
          slug: "hanging-leg-raise",
          locale: "cs",
          name: "Přitahování nohou ve visu",
          description: "Hanging leg raise na hrazdě.",
        },
      ];

      // Insert Czech localizations
      for (const loc of czechLocalizations) {
        const exerciseId = exerciseIds.get(loc.slug);
        if (exerciseId) {
          await db.runAsync(
            `INSERT INTO exercise_localizations (id, exercise_id, locale, name, description) 
             VALUES (?, ?, ?, ?, ?)`,
            [generateUUID(), exerciseId, loc.locale, loc.name, loc.description]
          );
        }
      }

      // Define English localizations
      const englishLocalizations = [
        // ------------ pressing  -------------------------------------------------
        {
          slug: "bench-press",
          locale: "en",
          name: "Bench Press",
          description: "Flat barbell press for chest.",
        },
        {
          slug: "incline-bench-press",
          locale: "en",
          name: "Incline Bench Press",
          description: "Barbell press on 30–45° incline bench.",
        },
        {
          slug: "decline-bench-press",
          locale: "en",
          name: "Decline Bench Press",
          description: "Barbell press on declined bench.",
        },
        {
          slug: "overhead-press",
          locale: "en",
          name: "Overhead Press",
          description: "Standing shoulder press.",
        },
        {
          slug: "push-press",
          locale: "en",
          name: "Push Press",
          description: "Assisted leg-drive overhead press.",
        },
        {
          slug: "dumbbell-shoulder-press",
          locale: "en",
          name: "Dumbbell Shoulder Press",
          description: "Seated or standing dumbbell press.",
        },
        {
          slug: "dips",
          locale: "en",
          name: "Dips",
          description: "Parallel-bar dips for chest/triceps.",
        },
        // ------------ rowing & pulls --------------------------------------------
        {
          slug: "barbell-row",
          locale: "en",
          name: "Barbell Row",
          description: "Bent-over barbell row.",
        },
        {
          slug: "pendlay-row",
          locale: "en",
          name: "Pendlay Row",
          description: "Strict row from floor each rep.",
        },
        {
          slug: "t-bar-row",
          locale: "en",
          name: "T-Bar Row",
          description: "Chest-supported T-bar row.",
        },
        {
          slug: "dumbbell-row",
          locale: "en",
          name: "Dumbbell Row",
          description: "Single-arm row on bench.",
        },
        {
          slug: "seated-cable-row",
          locale: "en",
          name: "Seated Cable Row",
          description: "Horizontal cable row.",
        },
        {
          slug: "lat-pulldown",
          locale: "en",
          name: "Lat Pulldown",
          description: "Wide-grip pulldown.",
        },
        { slug: "pull-up", locale: "en", name: "Pull-Up", description: "Pronated-grip pull-up." },
        { slug: "chin-up", locale: "en", name: "Chin-Up", description: "Supinated-grip pull-up." },
        // ------------ squats & quad dominant ------------------------------------
        {
          slug: "back-squat",
          locale: "en",
          name: "Back Squat",
          description: "High-/low-bar barbell squat.",
        },
        {
          slug: "front-squat",
          locale: "en",
          name: "Front Squat",
          description: "Barbell front-rack squat.",
        },
        {
          slug: "goblet-squat",
          locale: "en",
          name: "Goblet Squat",
          description: "Squat holding dumbbell or kettlebell.",
        },
        {
          slug: "bulgarian-split-squat",
          locale: "en",
          name: "Bulgarian Split Squat",
          description: "Rear-foot-elevated split squat.",
        },
        { slug: "lunge", locale: "en", name: "Lunge", description: "Alternating walking lunge." },
        {
          slug: "step-up",
          locale: "en",
          name: "Step-Up",
          description: "Dumbbell step-up onto box.",
        },
        {
          slug: "leg-press",
          locale: "en",
          name: "Leg Press",
          description: "45-degree sled leg press.",
        },
        // ------------ hip hinge / posterior chain -------------------------------
        {
          slug: "deadlift",
          locale: "en",
          name: "Deadlift",
          description: "Conventional barbell deadlift.",
        },
        {
          slug: "sumo-deadlift",
          locale: "en",
          name: "Sumo Deadlift",
          description: "Wide-stance deadlift.",
        },
        {
          slug: "romanian-deadlift",
          locale: "en",
          name: "Romanian Deadlift",
          description: "Hip-hinge RDL.",
        },
        {
          slug: "hip-thrust",
          locale: "en",
          name: "Hip Thrust",
          description: "Barbell hip thrust.",
        },
        {
          slug: "glute-bridge",
          locale: "en",
          name: "Glute Bridge",
          description: "Body-weight or loaded bridge.",
        },
        {
          slug: "kettlebell-swing",
          locale: "en",
          name: "Kettlebell Swing",
          description: "Hip-hinge kettlebell swing.",
        },
        // ------------ arms & shoulders ------------------------------------------
        {
          slug: "barbell-biceps-curl",
          locale: "en",
          name: "Barbell Biceps Curl",
          description: "Standing barbell curl.",
        },
        {
          slug: "dumbbell-hammer-curl",
          locale: "en",
          name: "Dumbbell Hammer Curl",
          description: "Neutral-grip dumbbell curl.",
        },
        {
          slug: "triceps-pushdown",
          locale: "en",
          name: "Triceps Pushdown",
          description: "Cable rope pushdown.",
        },
        {
          slug: "skull-crusher",
          locale: "en",
          name: "Skull Crusher",
          description: "Lying EZ-bar triceps extension.",
        },
        {
          slug: "lateral-raise",
          locale: "en",
          name: "Lateral Raise",
          description: "Dumbbell side raise.",
        },
        {
          slug: "face-pull",
          locale: "en",
          name: "Face Pull",
          description: "High-rope external-rotation pull.",
        },
        // ------------ chest accessories -----------------------------------------
        {
          slug: "incline-dumbbell-press",
          locale: "en",
          name: "Incline Dumbbell Press",
          description: "Incline bench dumbbell press.",
        },
        {
          slug: "dumbbell-fly",
          locale: "en",
          name: "Dumbbell Fly",
          description: "Flat bench dumbbell fly.",
        },
        {
          slug: "cable-crossover",
          locale: "en",
          name: "Cable Crossover",
          description: "Standing cable fly.",
        },
        // ------------ calves & core ---------------------------------------------
        {
          slug: "standing-calf-raise",
          locale: "en",
          name: "Standing Calf Raise",
          description: "Smith-/machine calf raise.",
        },
        {
          slug: "hanging-leg-raise",
          locale: "en",
          name: "Hanging Leg Raise",
          description: "Core exercise hanging from bar.",
        },
      ];

      // Insert English localizations
      for (const loc of englishLocalizations) {
        const exerciseId = exerciseIds.get(loc.slug);
        if (exerciseId) {
          await db.runAsync(
            `INSERT INTO exercise_localizations (id, exercise_id, locale, name, description) 
             VALUES (?, ?, ?, ?, ?)`,
            [generateUUID(), exerciseId, loc.locale, loc.name, loc.description]
          );
        }
      }

      console.log("Exercise data seeded successfully.");
    } else {
      console.log("Exercise data already exists, skipping seed.");
    }
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.log("Exercise data seeded unsuccessfully.", error.message);
  }
}
