export * from "./create";
export * from "./update-description";
export * from "./update-name";
export * from "./update-status";
export * from "./get";
export * from "./get-all";

export type Role = {
    id: string;
    name: string;
    description: string;
    status: string;
};
