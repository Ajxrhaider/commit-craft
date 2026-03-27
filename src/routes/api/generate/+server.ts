import { json } from '@sveltejs/kit';
import { GROQ_API_KEY } from '$env/static/private';

export async function POST({ request }) {
    try {
        const { diff } = await request.json();

        if (!diff) {
            return json({ error: 'No diff provided' }, { status: 400 });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a git expert. Generate 3 professional commit messages based on the diff. Return ONLY a JSON object: { \"messages\": [\"msg1\", \"msg2\", \"msg3\"] }"
                    },
                    { role: "user", content: diff }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return json({ error: data.error?.message || 'Groq API Error' }, { status: response.status });
        }

        const content = JSON.parse(data.choices[0].message.content);
        return json({ messages: content.messages });
    } catch (err) {
        console.error('Server Error:', err);
        return json({ error: 'Server connection failed' }, { status: 500 });
    }
}