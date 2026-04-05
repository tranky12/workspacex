/**
 * One-time migration: tạo Organization cho mỗi Workspace đang thiếu organizationId,
 * gán owner workspace làm org_owner. Chạy sau khi `npx prisma db push` với schema có organizationId optional.
 *
 *   npx tsx prisma/backfill-organizations.ts
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const orphaned = await prisma.workspace.findMany({
        where: { organizationId: null },
        include: { owner: { select: { id: true, email: true } } },
    })

    if (orphaned.length === 0) {
        console.log("No workspaces without organization — nothing to do.")
        return
    }

    for (const w of orphaned) {
        const base = w.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 30)
        const slug = `${base}-org-${Date.now().toString(36)}`
        const org = await prisma.organization.create({
            data: {
                name: `${w.name} — Organization`,
                slug,
                description: "Auto-created when migrating to organization model",
                members: {
                    create: {
                        userId: w.ownerId,
                        role: "org_owner",
                    },
                },
            },
        })
        await prisma.workspace.update({
            where: { id: w.id },
            data: { organizationId: org.id },
        })
        console.log(`Linked workspace "${w.name}" → org ${org.id}`)
    }

    console.log(`Done. Migrated ${orphaned.length} workspace(s).`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
