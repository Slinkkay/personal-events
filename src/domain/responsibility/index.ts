export * from "./create";
export * from "./associate-to-role";
export * from "./update-name";
export * from "./update-description";
export * from "./update-status";
export * from "./get";
export * from "./get-from-role";

export type Responsibility = {
    id: string;
    name: string;
    description: string;
    status: string;
};
