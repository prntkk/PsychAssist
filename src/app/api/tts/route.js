import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "your-eleven-labs-api-key";
    // Rachel - calm, professional female voice
    const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; 
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?optimize_streaming_latency=3`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5", // Fastest and highly expressive model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs Error:", err);
      throw new Error("ElevenLabs API error");
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
  }
}
