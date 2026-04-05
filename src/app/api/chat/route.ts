import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/../../auth"
import { geminiModel, PERSONA_PROMPTS } from "@/lib/gemini"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { persona, message, sessionId, history = [] } = body

        if (!persona || !message) {
            return NextResponse.json({ error: "Missing persona or message" }, { status: 400 })
        }

        const systemPrompt = PERSONA_PROMPTS[persona]
        if (!systemPrompt) {
            return NextResponse.json({ error: "Unknown persona" }, { status: 400 })
        }

        // Build conversation history for Gemini
        const formattedHistory = history.map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }))

        // Start chat with system instruction
        const chat = geminiModel.startChat({
            systemInstruction: systemPrompt,
            history: formattedHistory,
        })

        // Send the new message
        const result = await chat.sendMessage(message)
        const responseText = result.response.text()

        // Save messages to database
        const sid = sessionId || `${session.user.id}-${Date.now()}`
        await prisma.message.createMany({
            data: [
                {
                    userId: session.user.id!,
                    persona,
                    role: "user",
                    content: message,
                    sessionId: sid,
                },
                {
                    userId: session.user.id!,
                    persona,
                    role: "assistant",
                    content: responseText,
                    sessionId: sid,
                },
            ],
        })

        return NextResponse.json({
            response: responseText,
            sessionId: sid,
        })
    } catch (error) {
        console.error("Chat API error:", error)
        return NextResponse.json(
            { error: "Failed to get AI response" },
            { status: 500 }
        )
    }
}

// Get chat history for a session
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("sessionId")
    const persona = searchParams.get("persona")

    const messages = await prisma.message.findMany({
        where: {
            userId: session.user.id!,
            ...(sessionId ? { sessionId } : {}),
            ...(persona ? { persona } : {}),
        },
        orderBy: { createdAt: "asc" },
        take: 50,
    })

    return NextResponse.json({ messages })
}
