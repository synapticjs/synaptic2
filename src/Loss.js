//@flow
export type lossFn = (y_true: number, y_pred: number) => number;

export function mean_squared_error(y_true: number, y_pred: number): number {
    return (y_true - y_pred) ** 2;
}

export const mse = mean_squared_error; // alias