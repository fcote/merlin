import { skeletonRowSize } from '@helpers/sizes/skeletonRowSize'

const computeSkeletonRows = (windowHeight: number, offset: number) =>
  Math.round(Math.abs(windowHeight - offset) / skeletonRowSize)

export { computeSkeletonRows }
