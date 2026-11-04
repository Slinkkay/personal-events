import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { makeGraphQLPersistence } from "./services/graphql-client";

// --- TYPE DEFINITIONS ---
export type RoleStatus = "OPEN" | "CLOSED";
export type RespStatus = "OPEN" | "CLOSED";
export type RequestStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

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

type OmniStoreContextType = {
    data: OmniData;
    gqlConfig: GraphQLConfig;
    setGqlConfig: React.Dispatch<React.SetStateAction<GraphQLConfig>>;

    // Role Actions
    addRole: (role: Omit<Role, "id" | "createdAt"> & { id?: string }) => void;
    deleteRole: (id: string) => void;

    // Responsibility Actions (New Types)
    addResponsibility: (resp: Omit<Responsibility, "id"> & { id?: string }) => void;
    closeResponsibility: (id: string) => void;

    // Request Actions
    updateRequestStatus: (id: string, newStatus: RequestStatus) => void;
    addRequest: (req: Omit<RequestItem, "id"> & { id?: string }) => void;
};

export type OmniStorePersistence = {
    // Role Actions
    addRole: (role: Omit<Role, "id" | "createdAt"> & { id?: string }) => Promise<void>;
    deleteRole: (id: string) => Promise<void>;

    // Responsibility Actions
    addResponsibility: (resp: Omit<Responsibility, "id"> & { id?: string }) => Promise<void>;
    updateResponsibilityStatus: (id: string, status: string) => Promise<void>;
    deleteResponsibility: (id: string) => Promise<void>;

    // Request Actions
    updateRequestStatus: (id: string, newStatus: RequestStatus) => Promise<void>;
    addRequest: (req: Omit<RequestItem, "id"> & { id?: string }) => Promise<void>;
    deleteRequest: (id: string) => Promise<void>;

    // Current State
    getCurrentState: () => Promise<OmniData>;
};

const DEFAULT_GQL_CONFIG: GraphQLConfig = {
    endpoint: "http://localhost:3000/graphql",
    authToken: "",
    useMockFallback: true,
};

// --- CONTEXT CREATION ---
const OmniStoreContext = createContext<OmniStoreContextType | null>(null);

const persistence: OmniStorePersistence = makeGraphQLPersistence({
    endpoint: "http://localhost:3000/graphql",
    authToken: "your-token-here",
    onError: (err) => {
        console.error("Persistence Sync Error:", err.message);
    },
});

export const OmniStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<OmniData>(() => {
        return {
            requests: [],
            responsibilities: [],
            roles: [],
        };
    });

    const [gqlConfig, setGqlConfig] = useState<GraphQLConfig>(() => {
        const config = localStorage.getItem("omnitrack_gql_config");
        return config ? JSON.parse(config) : DEFAULT_GQL_CONFIG;
    });

    // --- FETCH DATA FROM GRAPHQL ---
    const fetchData = useCallback(async () => {
        try {
            const result = await persistence.getCurrentState();
            setData(result);
        } catch (err: any) {
            console.error("GraphQL Fetch Failed:", err);

            if (!gqlConfig.useMockFallback) {
                setData({ roles: [], responsibilities: [], requests: [] });
            }
        }
    }, [gqlConfig]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- MUTATION METHODS ---
    const addRole = async (roleInput: Omit<Role, "id" | "createdAt"> & { id?: string }) => {
        try {
            await persistence.addRole(roleInput);
            await fetchData();
        } catch (err: any) {
            console.error(err);
        }
    };

    const deleteRole = async (id: string) => {
        // Local removal (no delete mutation provided in schema)
        await persistence.deleteRole(id);
        await fetchData();
    };

    const updateRequestStatus = async (id: string, newStatus: RequestStatus) => {
        try {
            await persistence.updateRequestStatus(id, newStatus);
            await fetchData();
        } catch (err: any) {
            console.error("updateRequestStatus Mutation Failed:", err);
        }
    };

    const addResponsibility = async (respInput: Omit<Responsibility, "id"> & { id?: string }) => {
        try {
            await persistence.addResponsibility(respInput);
            await fetchData();
        } catch (err) {
            console.error("addResponsibility Mutation Failed:", err);
        }
    };

    const closeResponsibility = async (id: string) => {
        await persistence.updateResponsibilityStatus(id, "CLOSED");
        await fetchData();
    };

    // 2. Add Actions inside OmniStoreProvider:
    const addRequest = async (reqInput: Omit<RequestItem, "id"> & { id?: string }) => {
        try {
            await persistence.addRequest(reqInput);
            await fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <OmniStoreContext.Provider
            value={{
                data,
                gqlConfig,
                setGqlConfig,
                addRole,
                deleteRole,
                closeResponsibility,
                updateRequestStatus,
                addResponsibility,
                addRequest,
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
