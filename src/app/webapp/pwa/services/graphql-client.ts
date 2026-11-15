import { Role, Responsibility, RequestItem, RequestStatus, OmniData, OmniStorePersistence } from "../useOmniStore";

export type GraphQLPersistenceConfig = {
    endpoint: string;
    authToken?: string;
    onError?: (error: Error) => void;
};

// Raw GraphQL response mapping types
type GqlRequest = {
    id: string;
    description: string;
    dueDate: string;
    status: string;
};

type GqlResponsibility = {
    id: string;
    name: string;
    description: string;
    status: string;
    requests?: GqlRequest[];
};

type GqlRole = {
    id: string;
    name: string;
    description: string;
    status: string;
    responsibilities?: GqlResponsibility[];
};

export function makeGraphQLPersistence(config: GraphQLPersistenceConfig): OmniStorePersistence {
    const endpoint: string = config.endpoint;
    const authToken: string | undefined = config.authToken;
    const onError: ((error: Error) => void) | undefined = config.onError;

    // Private helper closure to execute GraphQL queries/mutations
    const executeQuery = async <T>(query: string, variables?: Record<string, any>): Promise<T> => {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify({ query, variables }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.errors && result.errors.length > 0) {
                throw new Error(result.errors.map((e: { message: string }) => e.message).join("\n"));
            }

            return result.data as T;
        } catch (err: any) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            if (onError) {
                onError(errorObj);
            }
            throw errorObj;
        }
    };

    return {
        async getCurrentState(): Promise<OmniData> {
            const q = `
              query GetFullHierarchy {
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

            const data = await executeQuery<{ roles: GqlRole[] }>(q);

            const roles: Role[] = [];
            const responsibilities: Responsibility[] = [];
            const requests: RequestItem[] = [];

            (data.roles || []).forEach((gqlRole) => {
                roles.push({
                    id: gqlRole.id,
                    title: gqlRole.name || "Untitled Role",
                    description: gqlRole.description || "",
                    status: (gqlRole.status as any) || "OPEN",
                    createdAt: new Date().toISOString().split("T")[0],
                });

                (gqlRole.responsibilities || []).forEach((gqlResp) => {
                    responsibilities.push({
                        id: gqlResp.id,
                        roleId: gqlRole.id,
                        title: gqlResp.name || "Untitled Responsibility",
                        description: gqlResp.description || "",
                        status: (gqlResp.status as any) || "OPEN",
                    });

                    (gqlResp.requests || []).forEach((gqlReq) => {
                        requests.push({
                            id: gqlReq.id,
                            responsibilityId: gqlResp.id,
                            description: gqlReq.description || "",
                            dueDate: gqlReq.dueDate || new Date().toISOString().split("T")[0],
                            status: (gqlReq.status as any) || "OPEN",
                        });
                    });
                });
            });

            return { roles, responsibilities, requests };
        },

        async addRole(role: Omit<Role, "id" | "createdAt"> & { id?: string }): Promise<void> {
            const q = `
              mutation CreateRole($name: String, $description: String) {
                roleCreate(name: $name, description: $description) {
                  id
                }
              }
            `;

            await executeQuery<{ roleCreate: { id: string } }>(q, {
                name: role.title,
                description: role.description,
            });
        },

        async updateRoleTitle(id, title): Promise<void> {
            const q = `
                mutation UpdateRoleTitle($id: String, $name: String) {
                    roleUpdateName(roleId: $id, name: $name)
                }
            `;
            await executeQuery(q, {
                id,
                name: title,
            });
        },

        async updateRoleDescription(id, description): Promise<void> {
            const q = `
                mutation UpdateRoleDescription($id: String, $description: String) {
                    roleUpdateDescription(roleId: $id, description: $description)
                }
            `;
            await executeQuery(q, {
                id,
                description,
            });
        },

        async closeRole(id: string): Promise<void> {
            const q = `
              mutation UpdateRoleStatus($roleId: String, $status: String) {
                roleUpdateStatus(roleId: $roleId, status: $status)
              }
            `;

            await executeQuery(q, {
                roleId: id,
                status: "CLOSED",
            });
        },

        async addResponsibility(resp: Omit<Responsibility, "id"> & { id?: string }): Promise<void> {
            const createQuery = `
              mutation CreateResp($name: String, $description: String) {
                responsibilityCreate(name: $name, description: $description) {
                  id
                }
              }
            `;

            const assocQuery = `
              mutation AssociateRespToRole($roleId: String, $responsibilityId: String) {
                responsibilityAssociateToRole(roleId: $roleId, responsibilityId: $responsibilityId)
              }
            `;

            const res = await executeQuery<{ responsibilityCreate: { id: string } }>(createQuery, {
                name: resp.title,
                description: resp.description,
            });

            const respId = res.responsibilityCreate.id;

            await executeQuery(assocQuery, {
                roleId: resp.roleId,
                responsibilityId: respId,
            });
        },

        async deleteResponsibility(id: string): Promise<void> {
            const q = `
              mutation UpdateRespStatus($responsibilityId: String, $status: String) {
                responsibilityUpdateStatus(responsibilityId: $responsibilityId, status: $status)
              }
            `;

            await executeQuery(q, {
                responsibilityId: id,
                status: "CLOSED",
            });
        },

        async updateResponsibilityStatus(id: string, status: string): Promise<void> {
            const q = `
              mutation UpdateRespStatus($responsibilityId: String, $status: String) {
                responsibilityUpdateStatus(responsibilityId: $responsibilityId, status: $status)
              }
            `;

            await executeQuery(q, {
                responsibilityId: id,
                status,
            });
        },

        async addRequest(req: Omit<RequestItem, "id"> & { id?: string }): Promise<void> {
            const createQuery = `
              mutation CreateReq($dueDate: String, $description: String) {
                requestCreate(dueDate: $dueDate, description: $description) {
                  id
                }
              }
            `;

            const assocQuery = `
              mutation AssociateReqToResp($responsibilityId: String, $requestId: String) {
                requestAssociateToResponsibility(responsibilityId: $responsibilityId, requestId: $requestId)
              }
            `;

            const res = await executeQuery<{ requestCreate: { id: string } }>(createQuery, {
                dueDate: req.dueDate,
                description: req.description,
            });

            const reqId = res.requestCreate.id;

            await executeQuery(assocQuery, {
                responsibilityId: req.responsibilityId,
                requestId: reqId,
            });
        },

        async updateRequestStatus(id: string, newStatus: RequestStatus): Promise<void> {
            const q = `
              mutation UpdateReqStatus($requestId: String, $status: String) {
                requestUpdateStatus(requestId: $requestId, status: $status)
              }
            `;

            await executeQuery(q, {
                requestId: id,
                status: newStatus,
            });
        },

        async deleteRequest(id: string): Promise<void> {
            const q = `
              mutation UpdateReqStatus($requestId: String, $status: String) {
                requestUpdateStatus(requestId: $requestId, status: $status)
              }
            `;

            await executeQuery(q, {
                requestId: id,
                status: "CLOSED",
            });
        },
        async updateRequestDescription(id: string, description: string): Promise<void> {
            const q = `
              mutation UpdateReqDescription($requestId: String, $description: String) {
                requestUpdateDescription( requestId: $requestId, description: $description)
              }
            `;

            await executeQuery(q, {
                requestId: id,
                description,
            });
        },
        async updateRequestDueDate(id: string, dueDate: string): Promise<void> {
            const q = `
              mutation UpdateReqDueDate($requestId: String, $dueDate: String) {
                requestUpdateDueDate(requestId: $requestId, dueDate: $dueDate)
              }
            `;

            await executeQuery(q, {
                requestId: id,
                dueDate,
            });
        },
    };
}
