import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET — list workspaces the current user can access:
// - member of workspace, OR org_owner/org_admin of the parent organization
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id

    const memberships = await prisma.workspaceMember.findMany({
        where: { userId },
        include: {
            workspace: {
                include: {
                    organization: { select: { id: true, name: true, slug: true } },
                    owner: { select: { name: true, email: true, image: true } },
                    _count: { select: { members: true, projects: true, deals: true } },
                },
            },
        },
    })

    const ownedWorkspaces = await prisma.workspace.findMany({
        where: { ownerId: userId },
        include: {
            organization: { select: { id: true, name: true, slug: true } },
            owner: { select: { name: true, email: true, image: true } },
            _count: { select: { members: true, projects: true, deals: true } },
        },
    })

    const orgElevated = await prisma.organizationMember.findMany({
        where: {
            userId,
            role: { in: ["org_owner", "org_admin"] },
        },
        select: { organizationId: true },
    })
    const elevatedOrgIds = [...new Set(orgElevated.map(e => e.organizationId))]

    const workspacesViaOrg =
        elevatedOrgIds.length > 0
            ? await prisma.workspace.findMany({
                  where: { organizationId: { in: elevatedOrgIds } },
                  include: {
                      organization: { select: { id: true, name: true, slug: true } },
                      owner: { select: { name: true, email: true, image: true } },
                      _count: { select: { members: true, projects: true, deals: true } },
                  },
              })
            : []

    type WsPayload = (typeof ownedWorkspaces)[0] & { memberRole: string }
    const byId = new Map<string, WsPayload>()

    for (const w of ownedWorkspaces) {
        byId.set(w.id, { ...w, memberRole: "owner" })
    }
    for (const m of memberships) {
        const w = m.workspace
        if (!byId.has(w.id)) byId.set(w.id, { ...w, memberRole: m.role })
    }
    for (const w of workspacesViaOrg) {
        if (!byId.has(w.id)) {
            byId.set(w.id, { ...w, memberRole: "org_admin" })
        }
    }

    return NextResponse.json({ workspaces: [...byId.values()] })
}

// POST — create workspace inside an organization (or auto-create org)
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id

    const body = await req.json()
    const { name, description, organizationId: bodyOrgId } = body
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

    let organizationId: string | null = typeof bodyOrgId === "string" ? bodyOrgId : null

    if (organizationId) {
        const canCreate = await prisma.organizationMember.findFirst({
            where: {
                organizationId,
                userId,
                role: { in: ["org_owner", "org_admin"] },
            },
        })
        if (!canCreate) {
            return NextResponse.json(
                { error: "Forbidden: cần org_owner hoặc org_admin để tạo workspace trong tổ chức này" },
                { status: 403 }
            )
        }
    } else {
        const org = await prisma.organization.create({
            data: {
                name: `${String(name).trim()} — Organization`,
                slug:
                    String(name)
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/-+/g, "-")
                        .substring(0, 28) +
                    "-" +
                    Date.now().toString(36),
                members: {
                    create: {
                        userId,
                        role: "org_owner",
                    },
                },
            },
        })
        organizationId = org.id
    }

    const slug =
        name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .substring(0, 40) + "-" + Date.now().toString(36)

    const workspace = await prisma.workspace.create({
        data: {
            name,
            slug,
            description,
            ownerId: userId,
            organizationId: organizationId!,
            members: {
                create: {
                    userId,
                    role: "owner",
                },
            },
            settings: { create: {} },
        },
        include: {
            organization: { select: { id: true, name: true, slug: true } },
            _count: { select: { members: true, projects: true } },
        },
    })

    await prisma.userSettings.upsert({
        where: { userId },
        update: { currentWorkspaceId: workspace.id },
        create: { userId, currentWorkspaceId: workspace.id },
    })

    return NextResponse.json({ workspace })
}
