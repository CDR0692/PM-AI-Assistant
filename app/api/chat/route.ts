import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set');
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Convert messages to OpenAI format
    const openaiMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add system message
    const systemMessage = {
      role: 'system',
      content: 'You are an expert Product Manager AI assistant. Help users with product strategy, feature prioritization, user research, roadmap planning, and other PM-related topics. Be concise and actionable.',
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage, ...openaiMessages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Failed to get response from OpenAI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const message = data.choices[0].message.content;

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}