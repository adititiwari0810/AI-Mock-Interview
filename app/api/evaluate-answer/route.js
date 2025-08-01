import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { question, userAnswer } = body;

    const prompt = `
You are acting as a fair, supportive, and detail-oriented school teacher tasked with evaluating a student's answer to a subject-related question. Your objective is to analyze both the *correctness* and the *depth of understanding* reflected in the answer.

You must:
1. Assign a numerical *rating from 1 to 10* (where 10 = excellent, 1 = very weak), based on:
   - Accuracy of the answer
   - Clarity of explanation
   - Completeness and depth
   - Use of relevant examples or structure
2. Provide *constructive feedback* in a friendly tone using *2–3 sentences*. Your feedback should:
   - Be honest but positive in tone
   - Highlight one strong point (if applicable)
   - Mention at least one specific way to improve the answer

Here is the data for evaluation:

*Question*: ${question}  
*Student's Answer*: ${userAnswer}

Guidelines for formatting the output:
- Format your entire response strictly as a single JSON object (no markdown or extra text).
- Do not include any explanations outside the object.
- Follow this exact format:

{
  "rating": <number between 1 and 10>,
  "feedback": "<2–3 sentence comment on strengths and areas of improvement>"
}

Examples of ideal feedback:
- “Good explanation overall. You clearly understood the concept but missed one key detail about the formula. Try to add that in future answers.”
- “The answer was mostly correct, but the structure was hard to follow. Work on organizing your points more clearly.”

Output ONLY the JSON object and nothing else.
`;

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
    const output = result?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Clean the result to remove any potential markdown wrapping
    const clean = output.replace("json", "").replace("", "").trim();

    const json = JSON.parse(clean);
    return NextResponse.json(json);

  } catch (error) {
    console.error("❌ Error in evaluate-answer route:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}