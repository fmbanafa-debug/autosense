export default async function handler(req, res) {
  // 1. Ensure it's a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Check for the API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API key is missing. Ensure GEMINI_API_KEY is set in Vercel Environment Variables and redeploy.' 
    });
  }

  const { userQuery, systemPrompt } = req.body;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  // 3. Prepare the Google API payload
  const payload = {
    contents: [{ 
      role: "user",
      parts: [{ text: userQuery }] 
    }],
    systemInstruction: { 
      parts: [{ text: systemPrompt }] 
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    // 4. Handle Google API specific errors
    if (!response.ok) {
      console.error('Google API Error:', result);
      return res.status(response.status).json({ 
        error: result.error?.message || `Google API returned status ${response.status}` 
      });
    }

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis could be generated.";
    return res.status(200).json({ text });

  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({ error: 'Network error: Failed to reach Google Gemini API' });
  }
}
