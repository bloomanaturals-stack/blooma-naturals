import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { quizResponses, products } from "@db/schema";
import { inArray, eq } from "drizzle-orm";

const skincareQuestions = [
  {
    id: "skin_type",
    question: "What is your skin type?",
    options: [
      { value: "oily", label: "Oily — My skin gets shiny by midday", products: [6, 8] },
      { value: "dry", label: "Dry — My skin feels tight and flaky", products: [4, 5, 7] },
      { value: "combination", label: "Combination — Oily T-zone, dry cheeks", products: [1, 4] },
      { value: "sensitive", label: "Sensitive — Easily irritated, prone to redness", products: [5, 8] },
    ],
  },
  {
    id: "main_concern",
    question: "What is your main skin concern?",
    options: [
      { value: "acne", label: "Acne & Pimples", products: [5, 6] },
      { value: "dark_spots", label: "Dark Spots & Pigmentation", products: [1, 7] },
      { value: "aging", label: "Fine Lines & Aging", products: [1, 7] },
      { value: "dullness", label: "Dull, Tired Skin", products: [1, 3, 7] },
      { value: "dryness", label: "Dryness & Dehydration", products: [4, 5] },
    ],
  },
  {
    id: "routine",
    question: "How much time do you spend on skincare daily?",
    options: [
      { value: "minimal", label: "5 minutes — Quick & easy", products: [3, 4, 5] },
      { value: "moderate", label: "15 minutes — A proper routine", products: [1, 8, 4] },
      { value: "extensive", label: "30+ minutes — Self-care ritual", products: [1, 6, 7, 4] },
    ],
  },
];

const haircareQuestions = [
  {
    id: "hair_type",
    question: "What is your hair type?",
    options: [
      { value: "straight", label: "Straight", products: [9, 10] },
      { value: "wavy", label: "Wavy", products: [2, 9, 10] },
      { value: "curly", label: "Curly", products: [2, 10] },
      { value: "coily", label: "Coily / Kinky", products: [2, 10] },
    ],
  },
  {
    id: "hair_concern",
    question: "What is your main hair concern?",
    options: [
      { value: "hair_fall", label: "Hair Fall & Thinning", products: [2, 9] },
      { value: "dandruff", label: "Dandruff & Itchy Scalp", products: [9] },
      { value: "dryness", label: "Dry & Frizzy Hair", products: [2, 10] },
      { value: "damage", label: "Damaged & Dull Hair", products: [10] },
    ],
  },
  {
    id: "hair_routine",
    question: "How often do you oil your hair?",
    options: [
      { value: "never", label: "Never — I want to start", products: [2] },
      { value: "weekly", label: "Once a week", products: [2, 9] },
      { value: "often", label: "2-3 times a week", products: [2, 9, 10] },
    ],
  },
];

export const quizRouter = createRouter({
  getQuestions: publicQuery
    .input(z.object({ quizType: z.enum(["skincare", "haircare"]) }))
    .query(async ({ input }) => {
      return input.quizType === "skincare" ? skincareQuestions : haircareQuestions;
    }),

  submit: publicQuery
    .input(
      z.object({
        quizType: z.enum(["skincare", "haircare"]),
        answers: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const questions = input.quizType === "skincare" ? skincareQuestions : haircareQuestions;
      const recommendedProductIds: number[] = [];

      for (const q of questions) {
        const answer = input.answers[q.id];
        const option = q.options.find((o) => o.value === answer);
        if (option) {
          recommendedProductIds.push(...option.products);
        }
      }

      const uniqueIds = [...new Set(recommendedProductIds)].slice(0, 6);

      const db = getDb();
      await db.insert(quizResponses).values({
        userId: ctx.user?.id ?? null,
        quizType: input.quizType,
        answers: input.answers as Record<string, string>,
        recommendations: uniqueIds,
      } as any);

      if (uniqueIds.length === 0) {
        const fallback = await db.query.products.findMany({
          where: eq(products.isActive, true),
          limit: 6,
          with: { category: true, sizes: true },
        });
        return { recommendations: fallback };
      }

      const dbProducts = await db.query.products.findMany({
        where: inArray(products.id, uniqueIds),
        with: { category: true, sizes: true },
      });

      return { recommendations: dbProducts };
    }),
});
