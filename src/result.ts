export interface SuccessResult {
    type: "success";
}

export interface SuccessValueResult<T> {
    type: "success";
    value: T;
}

export interface FailureResult {
    type: "failure";
}

export type Result = SuccessResult | FailureResult;

export type ValueResult<T> = SuccessValueResult<T> | FailureResult;

// --- Overloaded function declaration ---
export function success(): SuccessResult;
export function success<T>(value: T): SuccessValueResult<T>;

// --- Implementation ---
export function success<T>(value?: T): SuccessResult | SuccessValueResult<T> {
    if (arguments.length === 0) {
        return { type: "success" };
    } else {
        return { type: "success", value: value as T };
    }
}

export function failure(): FailureResult {
    return { type: "failure" };
}

export function isSuccess<T>(value: Result | ValueResult<T>): value is SuccessResult | SuccessValueResult<T> {
    return value.type === "success";
}

export function isFailure<T>(value: ValueResult<T> | Result): value is FailureResult {
    return value.type === "failure";
}
