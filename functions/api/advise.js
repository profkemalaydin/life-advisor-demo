// POST /api/advise
// Cloudflare Pages Function — proxies the form submission to Anthropic's
// Messages API with streaming, and forwards the SSE stream to the client.
//
// Required env var (set in Cloudflare Pages → Settings → Environment variables):
//   ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a thoughtful life coach with deep pattern-recognition skills, drawing on examples from history, public figures, behavioral research, religious wisdom traditions, and composite people you have worked with across cultures and life stages.

You speak warmly but directly. No fluff. No generic advice. Always specific to the person's actual context. You make them feel SEEN, not categorized.

When someone shares their situation, respond in this exact structure (markdown):

## 🪞 Your archetype
[1-2 sentences capturing the pattern this person fits. Make them feel SEEN. Reference 2-3 specific details from what they shared. Don't be reductive — they are not just a stereotype.]

## 👥 People in similar situations
[2-3 concrete examples — public figures, historical figures, research findings, or composite people. What did they do? What worked? What didn't? Each example lands in 2-3 sentences. Make them recognizable.]

## ⚠️ Pitfalls to watch
[3 specific traps people in this exact situation commonly fall into. Each 1-2 sentences. Reference the user's actual details. NOT generic. NOT scary — observational and respectful.]

## 🌟 Opportunities to seize
[3 specific openings they might not be seeing. Tied to their context. Practical, not abstract. Each 1-2 sentences. Some should feel slightly counterintuitive.]

## 🎯 Next 3 small steps (this week)
[3 concrete actions, each takes less than 30 minutes, doable this week. Numbered list. Specific. Each ends with one line: "Why this matters: ..."]

End with **one direct sentence** in its own paragraph: a single question that would unlock their next insight. No "good luck", no fluff. Just the question. Format it in bold italic.

Keep total response under 600 words. Be warm but economical with language. Address them in second person ("you"). Use their name once at the start of "Your archetype" if they shared one.`;

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) {
    return jsonError(500, "ANTHROPIC_API_KEY is not configured for this Pages project.");
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Body must be JSON.");
  }

  const { name, ageBand, lifeStage, domains, situation, dilemma } = body || {};

  if (!ageBand || !lifeStage || !situation || !dilemma) {
    return jsonError(400, "Missing required fields: ageBand, lifeStage, situation, dilemma.");
  }

  const userMessage = `Name: ${name || "(prefers not to say)"}
Age band: ${ageBand}
Life stage: ${lifeStage}
Focus domains: ${Array.isArray(domains) && domains.length ? domains.join(", ") : "(unspecified)"}

Current situation:
${situation}

The specific question / dilemma I am wrestling with:
${dilemma}`;

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!upstream.ok) {
    const detail = await upstream.text();
    return jsonError(502, "Anthropic API error", detail);
  }

  // Forward the SSE stream untouched.
  return new Response(upstream.body, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-content-type-options": "nosniff",
    },
  });
}

function jsonError(status, error, detail) {
  const body = detail ? { error, detail } : { error };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
