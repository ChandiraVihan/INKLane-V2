// In api/index.js

app.post('/api/ask-ai', async (req, res) => {
  try {
    // 1. We now expect an array called 'history'
    const { history } = req.body;
    console.log("Received conversation history:", history);

    // 2. Update validation to check for a non-empty array
    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: "Conversation history is required." });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY is not set on the server" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        // 3. Pass the entire history array to the AI
        messages: history
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Groq API Error:", errorData);
        const errorMessage = errorData?.error?.message || "An error occurred with the Groq API.";
        return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({ reply: reply });

  } catch (err) {
    console.error("Function Error:", err);
    res.status(500).json({ error: "An unknown server error occurred." });
  }
});