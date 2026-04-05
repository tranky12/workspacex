import type { Prisma } from "@prisma/client"

/** Quyền module trong một workspace (phòng ban). `none` = không truy cập. */
export type WorkspaceModule = "deals" | "clients" | "projects" | "knowledge" | "reports"
export type AccessLevel = "none" | "read" | "write"

export type WorkspacePermissionsMap = Partial<Record<WorkspaceModule, AccessLevel>>

const MODULES: WorkspaceModule[] = ["deals", "clients", "projects", "knowledge", "reports"]

/** Mặc định theo role khi permissions (JSON) null */
export function defaultPermissionsForRole(role: string): WorkspacePermissionsMap {
    if (role === "owner" || role === "admin") {
        return Object.fromEntries(MODULES.map(m => [m, "write"])) as WorkspacePermissionsMap
    }
    if (role === "consultant") {
        return Object.fromEntries(MODULES.map(m => [m, "write"])) as WorkspacePermissionsMap
    }
    if (role === "viewer") {
        return Object.fromEntries(MODULES.map(m => [m, "read"])) as WorkspacePermissionsMap
    }
    return Object.fromEntries(MODULES.map(m => [m, "read"])) as WorkspacePermissionsMap
}

/** Gộp role mặc định + override JSON (nếu có) */
export function effectivePermissions(
    role: string,
    permissions: Prisma.JsonValue | null | undefined
): WorkspacePermissionsMap {
    const base = defaultPermissionsForRole(role)
    if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) return base
    const o = permissions as Record<string, string>
    const out: WorkspacePermissionsMap = { ...base }
    for (const m of MODULES) {
        const v = o[m]
        if (v === "none" || v === "read" || v === "write") out[m] = v
    }
    return out
}

export function canAccessModule(
    perms: WorkspacePermissionsMap,
    module: WorkspaceModule,
    need: "read" | "write"
): boolean {
    const p = perms[module] ?? "none"
    if (p === "none") return false
    if (need === "read") return p === "read" || p === "write"
    return p === "write"
}
