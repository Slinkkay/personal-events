import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

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

    // Role Actions
    addRole: (role: Omit<Role, "id" | "createdAt"> & { id?: string }) => void;
    updateRole: (id: string, updatedFields: Partial<Role>) => void;
    deleteRole: (id: string) => void;

    // Responsibility Actions (New Types)
    addResponsibility: (resp: Omit<Responsibility, "id"> & { id?: string }) => void;
    updateResponsibility: (id: string, updatedFields: Partial<Responsibility>) => void;
    deleteResponsibility: (id: string) => void;

    // Request Actions
    updateRequestStatus: (id: string, newStatus: RequestStatus) => void;
    addRequest: (req: Omit<RequestItem, "id"> & { id?: string }) => void;
    updateRequest: (id: string, updatedFields: Partial<RequestItem>) => void;
    deleteRequest: (id: string) => void;
    resetData: () => void;
}

// --- DEFAULT INITIAL STATE ---
const DEFAULT_DATA: OmniData = {
    roles: [
        {
            id: "role-1",
            title: "Tech Lead for Team A",
            description: "Managing engineering deliverables [Google](https://www.google.com)...",
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

// --- HELPER FUNCTION FOR GRAPHQL FETCHING ---
async function fetchGraphQL<T>(
    config: GraphQLConfig,
    query: string,
    variables: Record<string, unknown> = {},
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (config.authToken) {
        headers["Authorization"] = `Bearer ${config.authToken}`;
    }

    const response = await fetch(config.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
    }

    return result.data as T;
}

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

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Sync state to LocalStorage
    useEffect(() => {
        localStorage.setItem("omnitrack_data_v1", JSON.stringify(data));
    }, [data]);

    useEffect(() => {
        localStorage.setItem("omnitrack_gql_config", JSON.stringify(gqlConfig));
    }, [gqlConfig]);

    // --- FETCH DATA FROM GRAPHQL ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const QUERY = `
            query FetchOmniData {
                roles {
                    id
                    name
                    description
                    status
                    responsibilities {
                        id
                        name
                        description
                        status
                        requests {
                            id
                            description
                            dueDate
                            status
                        }
                    }
                }
            }
        `;

        try {
            const result = await fetchGraphQL<{ roles: any[] }>(gqlConfig, QUERY);

            const fetchedRoles: Role[] = [];
            const fetchedResponsibilities: Responsibility[] = [];
            const fetchedRequests: RequestItem[] = [];

            if (result && result.roles) {
                result.roles.forEach((r) => {
                    fetchedRoles.push({
                        id: r.id,
                        title: r.name || "",
                        description: r.description || "",
                        status: (r.status as RoleStatus) || "OPEN",
                        createdAt: new Date().toISOString().split("T")[0],
                    });

                    if (r.responsibilities) {
                        r.responsibilities.forEach((resp: any) => {
                            fetchedResponsibilities.push({
                                id: resp.id,
                                roleId: r.id,
                                title: resp.name || "",
                                description: resp.description || "",
                                status: (resp.status as RespStatus) || "Active",
                            });

                            if (resp.requests) {
                                resp.requests.forEach((req: any) => {
                                    fetchedRequests.push({
                                        id: req.id,
                                        responsibilityId: resp.id,
                                        description: req.description || "",
                                        dueDate: req.dueDate || "",
                                        status: (req.status as RequestStatus) || "Ready",
                                    });
                                });
                            }
                        });
                    }
                });

                setData({
                    roles: fetchedRoles,
                    responsibilities: fetchedResponsibilities,
                    requests: fetchedRequests,
                });
            }
        } catch (err: any) {
            console.error("GraphQL Fetch Failed:", err);
            setError(err.message || "Failed to fetch data from GraphQL endpoint");

            if (!gqlConfig.useMockFallback) {
                setData({ roles: [], responsibilities: [], requests: [] });
            }
        } finally {
            setLoading(false);
        }
    }, [gqlConfig]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- MUTATION METHODS ---
    const addRole = async (roleInput: Omit<Role, "id" | "createdAt"> & { id?: string }) => {
        const createdAt = new Date().toISOString().split("T")[0];

        try {
            const MUTATION = `
                mutation RoleCreate($name: String, $description: String) {
                    roleCreate(name: $name, description: $description) {
                        id
                    }
                }
            `;
            const result = await fetchGraphQL<{ roleCreate: { id: string } }>(gqlConfig, MUTATION, {
                name: roleInput.title,
                description: roleInput.description,
            });

            const newRole: Role = {
                id: result.roleCreate.id,
                title: roleInput.title,
                description: roleInput.description,
                status: roleInput.status || "OPEN",
                createdAt,
            };

            setData((prev) => ({ ...prev, roles: [...prev.roles, newRole] }));
        } catch (err: any) {
            console.error("addRole Mutation Failed:", err);
            if (gqlConfig.useMockFallback) {
                const newRole: Role = {
                    ...roleInput,
                    id: roleInput.id || `role-${Date.now()}`,
                    createdAt,
                };
                setData((prev) => ({ ...prev, roles: [...prev.roles, newRole] }));
            }
        }
    };

    const updateRole = async (id: string, updatedFields: Partial<Role>) => {
        // Optimistic UI update
        setData((prev) => ({
            ...prev,
            roles: prev.roles.map((r) => (r.id === id ? { ...r, ...updatedFields } : r)),
        }));

        try {
            if (updatedFields.title !== undefined) {
                const MUTATION_NAME = `
                    mutation RoleUpdateName($roleId: String, $name: String) {
                        roleUpdateName(roleId: $roleId, name: $name)
                    }
                `;
                await fetchGraphQL(gqlConfig, MUTATION_NAME, {
                    roleId: id,
                    name: updatedFields.title,
                });
            }

            if (updatedFields.description !== undefined) {
                const MUTATION_DESC = `
                    mutation RoleUpdateDescription($roleId: String, $description: String) {
                        roleUpdateDescription(roleId: $roleId, description: $description)
                    }
                `;
                await fetchGraphQL(gqlConfig, MUTATION_DESC, {
                    roleId: id,
                    description: updatedFields.description,
                });
            }
        } catch (err: any) {
            console.error("updateRole Mutation Failed:", err);
            if (!gqlConfig.useMockFallback) {
                fetchData(); // Refetch to revert state on failure if fallback isn't enabled
            }
        }
    };

    const deleteRole = (id: string) => {
        // Local removal (no delete mutation provided in schema)
        setData((prev) => {
            const respIds = prev.responsibilities.filter((resp) => resp.roleId === id).map((resp) => resp.id);

            return {
                roles: prev.roles.filter((r) => r.id !== id),
                responsibilities: prev.responsibilities.filter((r) => r.roleId !== id),
                requests: prev.requests.filter((req) => !respIds.includes(req.responsibilityId)),
            };
        });
    };

    const updateRequestStatus = async (id: string, newStatus: RequestStatus) => {
        // Optimistic UI update
        setData((prev) => ({
            ...prev,
            requests: prev.requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req)),
        }));

        try {
            const MUTATION = `
                mutation RequestUpdateStatus($requestId: String, $status: String) {
                    requestUpdateStatus(requestId: $requestId, status: $status)
                }
            `;
            await fetchGraphQL(gqlConfig, MUTATION, {
                requestId: id,
                status: newStatus,
            });
        } catch (err: any) {
            console.error("updateRequestStatus Mutation Failed:", err);
            if (!gqlConfig.useMockFallback) {
                fetchData(); // Refetch on failure
            }
        }
    };

    const addResponsibility = (respInput: Omit<Responsibility, "id"> & { id?: string }) => {
        console.log(respInput);
        const newResp: Responsibility = {
            ...respInput,
            id: respInput.id || `resp-${Date.now()}`,
        };
        setData((prev) => ({ ...prev, responsibilities: [...prev.responsibilities, newResp] }));
    };

    const updateResponsibility = (id: string, updatedFields: Partial<Responsibility>) => {
        setData((prev) => ({
            ...prev,
            responsibilities: prev.responsibilities.map((resp) =>
                resp.id === id ? { ...resp, ...updatedFields } : resp,
            ),
        }));
    };

    const deleteResponsibility = (id: string) => {
        setData((prev) => ({
            ...prev,
            responsibilities: prev.responsibilities.filter((resp) => resp.id !== id),
            // Clean up child requests belonging to this responsibility
            requests: prev.requests.filter((req) => req.responsibilityId !== id),
        }));
    };

    // 2. Add Actions inside OmniStoreProvider:
    const addRequest = (reqInput: Omit<RequestItem, "id"> & { id?: string }) => {
        const newReq: RequestItem = {
            ...reqInput,
            id: reqInput.id || `req-${Date.now()}`,
        };
        setData((prev) => ({ ...prev, requests: [...prev.requests, newReq] }));
    };

    const updateRequest = (id: string, updatedFields: Partial<RequestItem>) => {
        setData((prev) => ({
            ...prev,
            requests: prev.requests.map((req) => (req.id === id ? { ...req, ...updatedFields } : req)),
        }));
    };

    const deleteRequest = (id: string) => {
        setData((prev) => ({
            ...prev,
            requests: prev.requests.filter((req) => req.id !== id),
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
                deleteResponsibility,
                updateRequestStatus,
                resetData,
                addResponsibility,
                updateResponsibility,
                addRequest,
                deleteRequest,
                updateRequest,
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
