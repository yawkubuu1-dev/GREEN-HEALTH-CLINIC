const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-gemini-test-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const sampleQuestions = {
  consultation_request: {
    question: "How can I request a consultation?",
    approvedAnswer:
      "You can submit the consultation form on the clinic website or contact the clinic through its WhatsApp link.",
  },
} as const;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function constantTimeEquals(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const expectedTestToken = Deno.env.get("GEMINI_TEST_TOKEN");
  const suppliedTestToken = request.headers.get("x-gemini-test-token") ?? "";
  if (
    !expectedTestToken ||
    !constantTimeEquals(suppliedTestToken, expectedTestToken)
  ) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("sampleId" in body) ||
    Object.keys(body).length !== 1 ||
    body.sampleId !== "consultation_request"
  ) {
    return jsonResponse(
      { error: "Use the approved consultation_request sample question." },
      400,
    );
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "GEMINI_API_KEY is not configured." }, 500);
  }

  const sample = sampleQuestions.consultation_request;
  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text:
                "You are testing a clinic FAQ assistant. Answer only the supplied general clinic FAQ using only its approved answer. Do not diagnose, recommend treatment, interpret symptoms, ask for personal or medical details, or invent clinic facts. If asked about a health concern, say the clinic team must help and direct the person to contact the clinic. Keep the reply brief.",
            }],
          },
          contents: [{
            role: "user",
            parts: [{
              text:
                `Question: ${sample.question}\nApproved answer: ${sample.approvedAnswer}`,
            }],
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 120,
          },
        }),
      },
    );
  } catch {
    return jsonResponse({ error: "Could not connect to the Gemini API." }, 502);
  }
  if (!geminiResponse.ok) {
    console.error(
      "Gemini API request failed with status:",
      geminiResponse.status,
    );
    return jsonResponse({ error: "Gemini API request failed." }, 502);
  }

  let result: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  try {
    result = await geminiResponse.json();
  } catch {
    return jsonResponse({ error: "Gemini returned an invalid response." }, 502);
  }

  const answer = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!answer) {
    return jsonResponse({ error: "Gemini did not return a text answer." }, 502);
  }

  return jsonResponse({
    testOnly: true,
    sampleId: "consultation_request",
    answer,
    notice:
      "Sample FAQ test only. This endpoint does not read or send WhatsApp messages.",
  });
});
