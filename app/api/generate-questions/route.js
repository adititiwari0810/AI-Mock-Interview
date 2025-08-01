import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "API route is working ✅ You reached it!" });
}

export async function POST(req) {
  const body = await req.json();
  const { topic, description, level } = body;

  const prompt = `
You are a helpful and encouraging school teacher preparing questions for a student.

Topic: ${topic}
Description: ${description}
Difficulty Level (1–10): ${level}

Instructions:
- Create 5 school-level questions about the above topic.
- Format your output as a JSON array like this:
[
  { "question": "What is X?", "answer": "X is Y." },
  ...
]
- Keep the language simple and clear.
- Include one real-life application-based question.
- Don’t mention you are an AI.

Only return the JSON array.
`;

  try {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const result = await response.json();

 

  const output = result?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  console.log("gemini raw output",output);

  try {
  const parsed = JSON.parse(output);
  console.log("✅ Parsed JSON successfully:", parsed);
} catch (err) {
  console.error("❌ JSON.parse failed!", err.message);
}


  return NextResponse.json({ questions: output });
} catch (err) {
  console.error("Gemini API Error ❌", err);
  return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
}
}