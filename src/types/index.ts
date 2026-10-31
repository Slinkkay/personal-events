export type RoleStatus = "OPEN" | "CLOSED";
export type RespStatus = "Active" | "In Progress" | "Completed";
export type ReqStatus = "Ready" | "Working" | "Complete";

export interface Role {
    id: string;
    title: string;
    description: string;
    status: RoleStatus;
    createdAt: string;
}

export interface Responsibility {
    id: string;
    roleId: string;
    title: string;
    description: string;
    status: RespStatus;
}

export interface RequestItem {
    id: string;
    responsibilityId: string;
    description: string;
    dueDate: string;
    status: ReqStatus;
}

export interface AppData {
    roles: Role[];
    responsibilities: Responsibility[];
    requests: RequestItem[];
}

export interface GqlConfig {
    endpoint: string;
    authToken: string;
    useMockFallback: boolean;
}

export interface ModalState {
    type: "role" | "responsibility" | "request" | "config" | null;
    id: string | null;
    parentId: string | null;
}
