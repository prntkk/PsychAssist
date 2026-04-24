import { Message } from '../store/useCompanionStore';

const OLLAMA_URL = '/api/chat'; // Resolves through Next.js SSR proxy securely
const MODEL_NAME = 'llama3'; // Ensure you have run `ollama run llama3` in your terminal

export class ChatService {
  static async generateResponse(
    history: Message[],
    currentEmotion: string
  ): Promise<string> {

    // 1. Create a dynamic system prompt based on the user's current face
    const systemPrompt: Message = {
      role: 'system',
      content: `You are PsychAssist, a highly empathetic, concise conversational AI companion. 
      You are speaking to the user out loud via voice. Keep responses brief, conversational, and natural. Do not use markdown, emojis, or lists.
      [CRITICAL VISUAL CONTEXT]: The user's face currently shows: ${currentEmotion.toUpperCase()}. 
      If they look sad, comfort them. If happy, share the joy. Let this implicitly guide your tone.`
    };

    // 2. Combine system prompt with the recent conversation history
    // We keep only the last 10 messages to prevent context window overflow
    const recentHistory = history.slice(-10);
    const messagesToSend = [systemPrompt, ...recentHistory];

    try {
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          v2: true, // Route to proxy passthrough securely
          messages: messagesToSend,
        }),
      });

      if (!response.ok) {
        throw new Error('Ollama connection failed. Is Ollama running?');
      }

      const data = await response.json();
      return data.message.content;

    } catch (error) {
      console.error("ChatService Error:", error);
      return "I'm having trouble connecting to my local neural network. Please make sure Ollama is running in your terminal.";
    }
  }
}