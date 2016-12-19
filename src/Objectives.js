//@flow
export type objectiveFn = (loss: number) => boolean;

export function any(objectives: objectiveFn[]): objectiveFn {
    return (loss) => objectives.some(objective => objective(loss));
}

export function every(objectives: objectiveFn[]): objectiveFn {
    return (loss) => objectives.every(objective => objective(loss));
}

export function max_loss(max_level: number): objectiveFn {
    return (loss) => loss < max_level;
}

export function iterations(counter: number, init_value: number = 0): objectiveFn {
    return () => counter < init_value++;
}