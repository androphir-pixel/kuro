export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);
    if (request.method !== "POST") return json({ error: "POST only" }, 405, corsHeaders);
    try {
      if (url.pathname === "/api/lesson") return await lesson(await request.json(), env, corsHeaders);
      if (url.pathname === "/api/feedback") return await feedback(await request.json(), env, corsHeaders);
      return json({ error: "Not found" }, 404, corsHeaders);
    } catch (e) {
      return json({ error: e.message || "Server error" }, 500, corsHeaders);
    }
  }
};
async function lesson(body, env, headers) {
  const topic = body.topic || "daily life";
  const memo = body.memo || "";
  const prompt = `You are an English speaking coach for a Japanese learner around TOEIC 700 aiming for TOEIC 800-900 and better daily conversation.

Create learning material based on:
Topic: ${topic}
Japanese memo: ${memo}

Return ONLY valid JSON with this schema:
{
  "script": "one-minute natural English script",
  "translation": "natural Japanese translation",
  "phrases": [{"expression":"...", "meaning":"Japanese meaning and usage"}],
  "vocabulary": [{"word":"...", "meaning":"Japanese meaning", "example":"English example"}],
  "conversation_questions": ["question 1", "question 2", "question 3", "question 4", "question 5"],
  "quiz": ["quiz 1", "quiz 2", "quiz 3", "quiz 4", "quiz 5"]
}

Rules:
- Keep the script natural and speakable.
- Use practical business/daily English.
- Avoid overly difficult expressions.`;
  const text = await callOpenAI(env, prompt);
  return json(parseJsonText(text), 200, headers);
}
async function feedback(body, env, headers) {
  const prompt = `You are an English speaking coach. Correct the learner's spoken English.

Reference script:
${body.script || ""}

Learner's spoken English:
${body.spoken || ""}

Return ONLY valid JSON:
{
  "feedback": "Use this format:\nOriginal:\n...\n\nCorrected Version:\n...\n\nBetter Natural Version:\n...\n\nAdvice in English:\n...\n\n日本語での解説:\n...\n\nPronunciation / Rhythm Tips:\n...\n\nUseful Phrases for Next Time:\n..."
}

Focus on natural communication, not tiny grammar details.`;
  const text = await callOpenAI(env, prompt);
  return json(parseJsonText(text), 200, headers);
}
async function callOpenAI(env, input) {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set in Worker secrets.");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {"Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json"},
    body: JSON.stringify({model: env.OPENAI_MODEL || "gpt-5.5", input, text: { format: { type: "text" } }})
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data));
  if (data.output_text) return data.output_text;
  const pieces = [];
  for (const item of data.output || []) for (const content of item.content || []) if (content.text) pieces.push(content.text);
  return pieces.join("
");
}
function parseJsonText(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try { return JSON.parse(cleaned); } catch { return { feedback: cleaned, script: cleaned }; }
}
function json(obj, status, headers) {return new Response(JSON.stringify(obj), {status, headers: {...headers, "Content-Type":"application/json; charset=utf-8"}})}
