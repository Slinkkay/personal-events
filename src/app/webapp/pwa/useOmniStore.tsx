import { makeGraphQLPersistence } from "./services/graphql-client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

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

type OmniStoreState = {
    data: OmniData;

    fetchCurrent: () => Promise<void>;

    // Role Actions
    addRole: (role: Omit<Role, "id" | "createdAt"> & { id?: string }) => void;
    closeRole: (id: string) => void;

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
    closeRole: (id: string) => Promise<void>;

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

// --- CONTEXT CREATION ---
const persistence: OmniStorePersistence = makeGraphQLPersistence({
    endpoint: "http://localhost:3000/graphql",
    authToken: "your-token-here",
    onError: (err) => {
        console.error("Persistence Sync Error:", err.message);
    },
});

export const useOmniStore = create<OmniStoreState>()(
    devtools(
        (setState, getState) => {
            // --- FETCH DATA FROM GRAPHQL ---
            const fetchData = async (source?: any) => {
                try {
                    const result = await persistence.getCurrentState();
                    source = source === undefined ? "Fetch Result" : source;
                    setState(
                        {
                            data: result,
                        },
                        undefined,
                        source,
                    );
                } catch (err) {
                    console.error("GraphQL Fetch Failed:", err);
                }
            };

            // --- MUTATION METHODS ---
            const addRole = async (roleInput: Omit<Role, "id" | "createdAt"> & { id?: string }) => {
                try {
                    await persistence.addRole(roleInput);
                    await fetchData();
                } catch (err: any) {
                    console.error(err);
                }
            };

            const closeRole = async (id: string) => {
                // Local removal (no delete mutation provided in schema)
                await persistence.closeRole(id);
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
                await fetchData({
                    type: "closeResponsibility",
                    id,
                });
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

            return {
                data: {
                    requests: [],
                    responsibilities: [],
                    roles: [],
                },
                fetchCurrent: fetchData,
                addRole,
                closeRole,
                closeResponsibility,
                updateRequestStatus,
                addResponsibility,
                addRequest,
            };
        },
        {
            name: "Tracker-Store",
            enabled: true,
        },
    ),
);
