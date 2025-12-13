import { serve } from "https://deno.land/std/http/server.ts";

// Define the expected request body structure for type safety
interface RequestBody {
  message: string;
}

// Define CORS headers. These are crucial for allowing your frontend to call this function.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allows any origin. For production, you might want to restrict this to your app's URL.
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Specify allowed methods
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', // Important for Supabase client
};

serve(async (req: Request) => {
  // This is the crucial step to handle CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message }: RequestBody = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        // Add CORS headers to the response
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY environment variable is not set" }),
        // Add CORS headers to the response
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
        console.error("Groq API Error:", errorData);
        return new Response(
            JSON.stringify({ error: errorData.error.message || "An error occurred with the Groq API." }),
            // Add CORS headers to the response
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content }),
      // Add CORS headers to the successful response
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      // Add CORS headers to the catch block response
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});