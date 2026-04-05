import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { chat, PERSONA_PROMPTS } from "@/lib/ai-providers"

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const messages = await prisma.message.findMany({
        where: { sessionId: `deal_room_${params.id}` },
        orderBy: { createdAt: "asc" }
    })
    return NextResponse.json({ messages })
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { message } = await req.json()

    // Save user message
    await prisma.message.create({
        data: {
            userId: session.user.id!,
            persona: "user",
            role: "user",
            content: message,
            sessionId: `deal_room_${params.id}`
        }
    })

    // Detect persona format in text, e.g. @dr_khoa, @thanh_hung
    let targetPersona = "consultant" // default
    let systemPersonaName = "Dr. Minh Khoa"
    if (message.includes("@thanh_hung")) { targetPersona = "techleader"; systemPersonaName = "Thanh Hùng" }
    else if (message.includes("@linh_anh")) { targetPersona = "designer"; systemPersonaName = "Linh Anh" }
    else if (message.includes("@mr_kien")) { targetPersona = "bod"; systemPersonaName = "Mr. Kiên" }
    else if (message.includes("@dr_khoa")) { targetPersona = "consultant"; systemPersonaName = "Dr. Khoa" }

    // Load Deal Context
    const deal = await prisma.deal.findUnique({ where: { id: params.id } })
    const contextPrefix = deal ? `CONTEXT: We are discussing the deal "${deal.title}" with company ${deal.company}. Stage: ${deal.stage}. Value: $${deal.value}. Notes: ${deal.notes || "None"}.\n` : ""

    const systemPrompt = PERSONA_PROMPTS[targetPersona as keyof typeof PERSONA_PROMPTS] ?? PERSONA_PROMPTS.consultant
    const fullSystemPrompt = `${contextPrefix}\n${systemPrompt}`

    // Load user AI settings
    const settings = await prisma.userSettings.findUnique({ where: { userId: session.user.id! } })
    const provider = settings?.aiProvider ?? "gemini"
    const model = settings?.aiModel ?? "gemini-1.5-flash"
    
    // Get history
    const historyData = await prisma.message.findMany({
        where: { sessionId: `deal_room_${params.id}` },
        orderBy: { createdAt: "asc" },
        take: 10
    })

    const history = historyData.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
    }))

    const replyContent = await chat({
        provider: provider as "gemini" | "openai" | "claude" | "azure",
        model,
        apiKey: process.env.GEMINI_API_KEY || "", 
        systemPrompt: fullSystemPrompt,
        history,
        message,
    })

    const newReply = await prisma.message.create({
        data: {
            userId: session.user.id!,
            persona: systemPersonaName,
            role: "assistant",
            content: replyContent,
            sessionId: `deal_room_${params.id}`
        }
    })

    return NextResponse.json({ reply: newReply })
}
