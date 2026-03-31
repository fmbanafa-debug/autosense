export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const { userQuery, systemPrompt } = req.body;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured in Vercel environment variables.' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  try {
    // Exponential backoff retry logic
    let result;
    let retries = 5;
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        result = await response.json();
        break;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis could be generated.";
    return res.status(200).json({ text });

  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect to Gemini API' });
  }
}
