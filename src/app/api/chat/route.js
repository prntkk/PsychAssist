import { NextResponse } from 'next/server';

const SYSTEM_PROMPTS = {
  cbt: "You are a CBT Guide. Help the user identify cognitive distortions. Ask for evidence supporting/contradicting their thoughts. Be structured and analytical.",
  act: "You are an ACT Assistant. Focus on acceptance and commitment therapy. Help the user identify core values and practice mindfulness.",
  stoic: "You are a Stoic Philosopher guide. Help the user focus only on what is within their control. Use principles from Marcus Aurelius and Seneca. Be calm, grounded, and practical.",
  mindfulness: "You are a Mindfulness Coach. Focus on grounding techniques, breathing exercises, and staying present in the current moment. Be very gentle and soothing.",
  vent: "You are an empathetic listener. Do not try to solve the user's problems. Just validate their feelings, use active listening, and offer a safe space to vent."
};

const CRISIS_KEYWORDS = ["kill myself", "suicide", "end it all", "want to die", "self harm", "hurt myself"];

export async function POST(req) {
  try {
    const { messages, mode = 'cbt', v2 } = await req.json();

    // V2 Multi-modal Passthrough (Bypasses CORS restrictions on the browser securely)
    if (v2) {
      const v2Response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma3:12b',
          messages: messages,
          stream: false,
        }),
      });
      const v2Data = await v2Response.json();
      return NextResponse.json(v2Data);
    }

    const latestMessage = messages[messages.length - 1].content.toLowerCase();

    // Crisis Gate
    const isCrisis = CRISIS_KEYWORDS.some(keyword => latestMessage.includes(keyword));
    if (isCrisis) {
      return NextResponse.json({ message: "CRISIS_DETECTED", isCrisis: true });
    }

    const systemMessage = {
      role: 'system',
      content: `${SYSTEM_PROMPTS[mode]} CRITICAL RULES: 1. NEVER diagnose. 2. Keep responses concise. 3. Do not use emojis. 4. State you are an AI if asked.`
    };

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3:12b',
        messages: [systemMessage, ...messages],
        stream: false, 
      }),
    });

    const data = await response.json();
    return NextResponse.json({ message: data.message });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to connect to local AI.' }, { status: 500 });
  }
}