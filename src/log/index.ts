export type AppLogger = {
    info(params: { type: string; [key: string]: any }): void;
    error(params: { type: string; err?: Error; [key: string]: any }): void;
};
