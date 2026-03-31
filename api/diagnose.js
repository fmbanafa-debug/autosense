export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API key is missing. Ensure GEMINI_API_KEY is set in Vercel Environment Variables and redeploy.' 
    });
  }

  const { userQuery, systemPrompt } = req.body;
  
  /**
   * Using 'gemini-flash-latest' alias. 
   * This points to the current stable Flash model (e.g., 1.5 or 2.0) 
   * and ensures the app doesn't break when specific versions are deprecated.
   */
  const modelId = "gemini-flash-latest"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: `System Instructions: ${systemPrompt}\n\nUser Query: ${userQuery}` }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: result.error?.message || `API Error: ${response.status}` 
      });
    }

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis could be generated.";
    return res.status(200).json({ text });

  } catch (error) {
    return res.status(500).json({ error: 'Network error: Failed to reach Google Gemini API' });
  }
}
