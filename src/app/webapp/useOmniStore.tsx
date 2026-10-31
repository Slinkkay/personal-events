import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// --- TYPE DEFINITIONS ---
export type RoleStatus = "OPEN" | "CLOSED";
export type RespStatus = "Active" | "In Progress" | "Completed";
export type RequestStatus = "Ready" | "Working" | "Complete";

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
    status: RequestStatus;
}

export interface OmniData {
    roles: Role[];
    responsibilities: Responsibility[];
    requests: RequestItem[];
}

export interface GraphQLConfig {
    endpoint: string;
    authToken: string;
    useMockFallback: boolean;
}

interface OmniStoreContextType {
    data: OmniData;
    gqlConfig: GraphQLConfig;
    setGqlConfig: React.Dispatch<React.SetStateAction<GraphQLConfig>>;
    addRole: (role: Omit<Role, "id" | "createdAt"> & { id?: string }) => void;
    updateRole: (id: string, updatedFields: Partial<Role>) => void;
    deleteRole: (id: string) => void;
    updateRequestStatus: (id: string, newStatus: RequestStatus) => void;
    resetData: () => void;
}

// --- DEFAULT INITIAL STATE ---
const DEFAULT_DATA: OmniData = {
    roles: [
        {
            id: "role-1",
            title: "Tech Lead for Team A",
            description: "Managing engineering deliverables...",
            status: "OPEN",
            createdAt: "2026-01-10",
        },
        {
            id: "role-2",
            title: "Homeowner",
            description: "Maintaining property value...",
            status: "OPEN",
            createdAt: "2026-02-01",
        },
    ],
    responsibilities: [
        {
            id: "resp-1",
            roleId: "role-1",
            title: "Lead for Feature X Development",
            description: "Drive end-to-end design...",
            status: "In Progress",
        },
    ],
    requests: [
        {
            id: "req-1",
            responsibilityId: "resp-1",
            description: "Complete API Design Document\nDraft the OpenAPI spec.",
            dueDate: "2026-11-02",
            status: "Working",
        },
    ],
};

const DEFAULT_GQL_CONFIG: GraphQLConfig = {
    endpoint: "http://localhost:3000/graphql",
    authToken: "",
    useMockFallback: true,
};

// --- CONTEXT CREATION ---
const OmniStoreContext = createContext<OmniStoreContextType | null>(null);

export const OmniStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<OmniData>(() => {
        const localData = localStorage.getItem("omnitrack_data_v1");
        return localData ? JSON.parse(localData) : DEFAULT_DATA;
    });

    const [gqlConfig, setGqlConfig] = useState<GraphQLConfig>(() => {
        const config = localStorage.getItem("omnitrack_gql_config");
        return config ? JSON.parse(config) : DEFAULT_GQL_CONFIG;
    });

    // Sync to LocalStorage on state changes
    useEffect(() => {
        localStorage.setItem("omnitrack_data_v1", JSON.stringify(data));
    }, [data]);

    useEffect(() => {
        localStorage.setItem("omnitrack_gql_config", JSON.stringify(gqlConfig));
    }, [gqlConfig]);

    // --- MUTATION METHODS ---
    const addRole = (roleInput: Omit<Role, "id" | "createdAt"> & { id?: string }) => {
        const newRole: Role = {
            ...roleInput,
            id: roleInput.id || `role-${Date.now()}`,
            createdAt: new Date().toISOString().split("T")[0],
        };
        setData((prev) => ({ ...prev, roles: [...prev.roles, newRole] }));
    };

    const updateRole = (id: string, updatedFields: Partial<Role>) => {
        setData((prev) => ({
            ...prev,
            roles: prev.roles.map((r) => (r.id === id ? { ...r, ...updatedFields } : r)),
        }));
    };

    const deleteRole = (id: string) => {
        setData((prev) => {
            const respIds = prev.responsibilities.filter((resp) => resp.roleId === id).map((resp) => resp.id);

            return {
                roles: prev.roles.filter((r) => r.id !== id),
                responsibilities: prev.responsibilities.filter((r) => r.roleId !== id),
                requests: prev.requests.filter((req) => !respIds.includes(req.responsibilityId)),
            };
        });
    };

    const updateRequestStatus = (id: string, newStatus: RequestStatus) => {
        setData((prev) => ({
            ...prev,
            requests: prev.requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req)),
        }));
    };

    const resetData = () => {
        setData(DEFAULT_DATA);
    };

    return (
        <OmniStoreContext.Provider
            value={{
                data,
                gqlConfig,
                setGqlConfig,
                addRole,
                updateRole,
                deleteRole,
                updateRequestStatus,
                resetData,
            }}
        >
            {children}
        </OmniStoreContext.Provider>
    );
};

export const useOmniStore = (): OmniStoreContextType => {
    const context = useContext(OmniStoreContext);
    if (!context) {
        throw new Error("useOmniStore must be used within an OmniStoreProvider");
    }
    return context;
};
