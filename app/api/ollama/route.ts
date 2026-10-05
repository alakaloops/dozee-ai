// Route handler for Ollama AI requests
import { NextResponse } from 'next/server';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages) {
      return NextResponse.json({ error: 'Missing messages array' }, { status: 400 });
    }
    const modelName = "gemma3:4b"; // exact model name
    const ollamaRes = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Ensure streaming is disabled so we get a single JSON payload
      body: JSON.stringify({ model: modelName, messages, stream: false }),
    });
    const data = await ollamaRes.json();
    // Forward Ollama response directly – frontend will pick data.message?.content
    return NextResponse.json(data, { status: ollamaRes.status });
  } catch (err) {
    console.error("Ollama proxy error:", err);
    // In development return detailed error, otherwise generic
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
