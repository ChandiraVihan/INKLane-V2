// supabase/functions/ask-ai/index.ts

import { serve } from "https://deno.land/std/http/server.ts";

interface RequestBody {
  message: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // --- START: SECURITY MODIFICATION ---
  // 1. Get the function secret from environment variables
  const FUNCTION_SECRET = Deno.env.get("FUNCTION_SECRET");

  // 2. Check for the Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${FUNCTION_SECRET}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  // --- END: SECURITY MODIFICATION ---

  try {
    const { message }: RequestBody = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY environment variable is not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-instruct",
        messages: [{ role: "user", content: message }]
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        return new Response(
            JSON.stringify({ error: errorData.error.message || "An error occurred with the Groq API." }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});