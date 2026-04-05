import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET — organizations the current user belongs to
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const memberships = await prisma.organizationMember.findMany({
        where: { userId: session.user.id },
        include: {
            organization: {
                include: {
                    _count: { select: { workspaces: true, members: true } },
                },
            },
        },
    })

    return NextResponse.json({
        organizations: memberships.map(m => ({
            ...m.organization,
            orgRole: m.role,
        })),
    })
}

// POST — create organization (user becomes org_owner)
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, description } = await req.json()
    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "name required" }, { status: 400 })
    }

    const slug =
        name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .substring(0, 36) + "-" + Date.now().toString(36)

    const org = await prisma.organization.create({
        data: {
            name: name.trim(),
            slug,
            description: description?.trim() || null,
            members: {
                create: {
                    userId: session.user.id,
                    role: "org_owner",
                },
            },
        },
        include: { _count: { select: { workspaces: true, members: true } } },
    })

    return NextResponse.json({ organization: org })
}
