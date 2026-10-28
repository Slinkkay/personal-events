import {
    AssociateToRole,
    CreateResponsibility,
    GetResponsibility,
    GetResponsibilityFromRole,
    Responsibility,
    UpdateResponsibilityDescription,
    UpdateResponsibilityName,
} from "@/domain/responsibility";
import { isSuccess } from "@/result";

export type ResponsibilityMutation = {
    responsibilityCreate: (_: unknown, command: any) => any;
    responsibilityAssociateToRole: (_: unknown, command: any) => any;
    responsibilityUpdateName: (_: unknown, command: any) => any;
    responsibilityUpdateDescription: (_: unknown, command: any) => any;
};

export function makeResponsibilityMutation(
    createResponsibility: CreateResponsibility,
    associateToRole: AssociateToRole,
    updateResponsibilityName: UpdateResponsibilityName,
    updateResponsibilityDescription: UpdateResponsibilityDescription,
): ResponsibilityMutation {
    return {
        responsibilityCreate: async (_: unknown, { description, name }: { description: string; name: string }) => {
            const result = await createResponsibility.create({
                name,
                description,
            });

            if (!isSuccess(result)) {
                throw new Error("Failed to create responsibility");
            }

            return { id: result.value };
        },
        responsibilityAssociateToRole: async (
            _: unknown,
            { responsibilityId, roleId }: { roleId: string; responsibilityId: string },
        ) => {
            const result = await associateToRole.associate({
                responsibilityId,
                roleId,
            });

            if (!isSuccess(result)) {
                throw new Error("Failed to associate to role");
            }
            return true;
        },
        responsibilityUpdateName: async (_: unknown, command: any) => {
            const result = await updateResponsibilityName.update({
                name: command.name,
                id: command.responsibilityId,
            });

            if (!isSuccess(result)) {
                throw new Error("Failed to update name on responsibility");
            }

            return true;
        },
        responsibilityUpdateDescription: async (_: unknown, command: any) => {
            const result = await updateResponsibilityDescription.update({
                description: command.description,
                id: command.responsibilityId,
            });

            if (!isSuccess(result)) {
                throw new Error("Failed to update description on responsibility");
            }

            return true;
        },
    };
}

export type ResponsibilityQuery = {
    responsibility: (_: unknown, command: any) => Promise<Responsibility>;
};

export function makeResponsibilityQuery(getResponsibility: GetResponsibility): ResponsibilityQuery {
    return {
        responsibility: async (_, { id }) => {
            const result = await getResponsibility.get({ id });
            if (!isSuccess(result)) {
                throw new Error("Failed to get responsibility");
            }

            return result.value;
        },
    };
}

export type ResponsibilityGraphQL = {
    Query: ResponsibilityQuery;
    Mutation: ResponsibilityMutation;
    Role: {
        responsibilities: (parent: { id: string }) => Promise<any>;
    };
};

export function makeResponsibilityGraphQL(
    Query: ResponsibilityQuery,
    Mutation: ResponsibilityMutation,
    getResponsibilityFromRole: GetResponsibilityFromRole,
): ResponsibilityGraphQL {
    return {
        Mutation,
        Query,
        Role: {
            responsibilities: async ({ id }) => {
                const result = await getResponsibilityFromRole.get({
                    roleId: id,
                });

                if (!isSuccess(result)) {
                    throw new Error("Failed to get responsibility from role");
                }

                return result.value;
            },
        },
    };
}
