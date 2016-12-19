declare type Activation = Matrix;
declare type Activations = Activation | Activations[];

declare type Delta = Matrix; //sometimes delta is not needed
declare type Deltas = ?Delta | Deltas[];

declare type Err = Matrix;

declare type Gradient = Matrix;

declare type Shape = number[];

declare type Weights = Matrix;