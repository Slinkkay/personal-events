export * from "./create";
export * from "./update-description";
export * from "./update-name";
export * from "./get";

export type Role = {
    id: string;
    name: string;
    description: string;
    status: string;
};
