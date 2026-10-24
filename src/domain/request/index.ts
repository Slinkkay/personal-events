export * from "./create";
export * from "./associate-to-responsibility";
export * from "./update-description";
export * from "./update-due-date";
export * from "./update-status";
export * from "./get";
export * from "./get-all";

export type Request = {
    id: string;
    description: string;
    dueDate: string;
    status: string;
};
