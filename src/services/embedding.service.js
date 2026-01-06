import OpenAI from "openai";

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not loaded");
    }

    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return client;
}

export async function embedText(text) {
  const res = await getClient().embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  return res.data[0].embedding;
}
