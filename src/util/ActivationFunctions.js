//@flow

export type activationFn = {
    f: (input: number) => number;
    df: (input: number) => number;
}

export const linear: activationFn = {
    f: x => x,
    df: x => 1,
}

export const sigmoid: activationFn = {
    f: x => 1 / (1 + Math.exp(-x)),
    df: x => {
        const fx = sigmoid.f(x);
        return fx * (1 - fx);
    }
}

export default {linear, sigmoid};