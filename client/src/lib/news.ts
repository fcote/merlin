export enum NewsType {
  standard = 'standard',
  pressRelease = 'pressRelease',
}

export type News = {
  id: number | string
  date: string
  type: NewsType
  title: string
  content: string
  website: string
  url: string
}
