export type HistoricalPrice = {
  id: string
  date: string
  label: string
  open: number
  high: number
  low: number
  close: number
  adjustedClose: number
  volume: number
  unadjustedVolume: number
  change: number
  changePercent: number
  volumeWeightedAveragePrice: number
}
