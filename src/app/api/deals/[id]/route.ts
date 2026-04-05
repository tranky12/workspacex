import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/../../auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/deals/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { title, company, value, stage, industry, solution, notes, nextStep, score, meddicData } = body

    const deal = await prisma.deal.updateMany({
        where: { id: params.id, ownerId: session.user.id! },
        data: {
            ...(title !== undefined && { title }),
            ...(company !== undefined && { company }),
            ...(value !== undefined && { value: parseFloat(value) || 0 }),
            ...(stage !== undefined && { stage }),
            ...(industry !== undefined && { industry }),
            ...(solution !== undefined && { solution }),
            ...(notes !== undefined && { notes }),
            ...(nextStep !== undefined && { nextStep }),
            ...(score !== undefined && { score }),
            ...(meddicData !== undefined && { meddicData }),
        },
    })

    return NextResponse.json({ success: true, updated: deal.count })
}

// DELETE /api/deals/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await prisma.deal.deleteMany({ where: { id: params.id, ownerId: session.user.id! } })
    return NextResponse.json({ success: true })
}
