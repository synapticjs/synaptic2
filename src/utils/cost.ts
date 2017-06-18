export enum CostTypes {
  MEAN_SQUARE_ERROR,
  CROSS_ENTROPY,
  BINARY,
  HINGE,
  MEAN_SQUARE_LOG_ERROR,
  MEAN_ABSOLUTE_ERROR,
  MEAN_ABSOLUTE_PERCENTAGE_ERROR,
  SOFTMAX
}

export function cost(target: number[], predicted: ArrayLike<number>, costType: CostTypes): number {
  let i: number, x = 0;

  switch (costType) {
    // https://en.wikipedia.org/wiki/Hinge_loss
    case CostTypes.HINGE:
      for (i = 0; i < predicted.length; i++) {
        x += Math.max(0, 1 - target[i] * predicted[i]);
      }
      return x;
    case CostTypes.SOFTMAX:
      for (i = 0; i < predicted.length; i++) {
        if (target[i] > 0) {
          if (predicted[i] > 0) {
            x += target[i] * Math.log(predicted[i]);
          } else {
            x += target[i] * Math.E;
          }
        }
      }
      return -x / Math.E;
    case CostTypes.MEAN_ABSOLUTE_PERCENTAGE_ERROR:
      for (i = 0; i < predicted.length; i++) {
        x += Math.abs((predicted[i] - target[i]) / Math.max(target[i], 1e-15));
      }
      return x / predicted.length;

    case CostTypes.MEAN_SQUARE_LOG_ERROR:
      for (i = 0; i < predicted.length; i++) {
        x += Math.log(Math.max(target[i], 1e-15)) - Math.log(Math.max(predicted[i], 1e-15));
      }
      return x;

    case CostTypes.MEAN_SQUARE_ERROR:
      for (i = 0; i < target.length; i++) {
        x += Math.pow(target[i] - predicted[i], 2);
      }
      return x / target.length;

    case CostTypes.MEAN_ABSOLUTE_ERROR:
      for (i = 0; i < predicted.length; i++) {
        x += Math.abs(target[i] - predicted[i]);
      }
      return x / predicted.length;

    case CostTypes.CROSS_ENTROPY:
      for (i = 0; i < target.length; i++) {
        if (target[i] > 0) {
          if (predicted[i] > 0) {
            x -= target[i] * Math.log(predicted[i]);
          } else {
            x -= target[i] * Math.E;
          }
        }

        if (target[i] != 1) {

          if ((1 - predicted[i]) > 0) {
            x -= (1 - target[i]) * Math.log(1 - predicted[i]);
          } else {
            x -= (1 - target[i]) * Math.E;
          }
        }
      }
      return x;

    case CostTypes.BINARY:
      for (i = 0; i < target.length; i++) {
        x += Math.round(target[i] * 2) != Math.round(predicted[i] * 2) ? 1 : 0;
      }
      return x;
  }
}