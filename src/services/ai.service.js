import OpenAI from "openai";

export async function analyzeArchitecture(imageUrl) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
You are an architectural design expert.

Analyze the image and return ONLY valid JSON with EXACTLY these fields:

{
  "space_category": "living" | "bedroom",
  "movement": string,
  "family": string,
  "variant": string,
  "color_keywords": string[],
  "design_philosophy": string,
  "visual_features": string[],
  "confidence": "low" | "medium" | "high",
  "notes": string
}

Space category rules:
- "living" = living room, lounge, family room, common area, open-plan living
- "bedroom" = any sleeping or resting space
- Choose the MOST LIKELY category
- Always choose exactly ONE of the two values

Definitions:
- movement = broad architectural movement (e.g. Modernism, Postmodernism, Vernacular)
- family = recognized architectural family within the movement
- variant = a nuanced, specific sub-style within the family

Color rules:
- color_keywords must be 2–3 short natural-language descriptors
- describe overall color impression

Design philosophy rules:
- ONE sentence describing design intent or attitude

Rules:
- ALWAYS try to identify a meaningful variant
- Do NOT repeat family or movement names in variant
- visual_features must be short phrases
- notes must be ONE cautious sentence
- Do NOT include markdown
- Do NOT include explanations
- Do NOT include extra keys
`
          },
          {
            type: "input_image",
            image_url: imageUrl
          }
        ]
      }
    ]
  });

  const raw = response.output_text;
const parsed = JSON.parse(raw);

const rawCategory = parsed.space_category?.toLowerCase();

const space_category =
  rawCategory === "bedroom" ? "bedroom" : "living";

  


return {
  space_category,

  movement: parsed.movement || "Unknown",
  family: parsed.family || "Unknown",
  variant: parsed.variant || "Unknown",

  color_keywords: Array.isArray(parsed.color_keywords)
    ? parsed.color_keywords
    : [],

  design_philosophy: parsed.design_philosophy || "",

  visual_features: Array.isArray(parsed.visual_features)
    ? parsed.visual_features
    : [],

  confidence: ["low", "medium", "high"].includes(parsed.confidence)
    ? parsed.confidence
    : "low",

  notes: parsed.notes || ""
};

}
