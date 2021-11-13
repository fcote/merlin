import { omit, uniqBy } from 'lodash'

import { newsLink } from '@links/links'
import { SecurityNewsResult } from '@links/types'
import { News } from '@models/news'
import { Security } from '@models/security'
import { SecuritySyncEmitter } from '@services/security/sync'
import { ServiceMethod } from '@services/service'
import { ApolloResourceNotFound } from '@typings/errors/apolloErrors'
import { DefaultErrorCodes } from '@typings/errors/errorCodes'

class NewsSyncMethod extends ServiceMethod {
  private security: Security
  private currentNews: News[]
  private securitySyncEmitter?: SecuritySyncEmitter
  private startProgress: number = 0
  private targetProgress: number = 0

  private setCurrentNews = async () => {
    this.currentNews = await News.query(this.trx)
      .select('id', 'date', 'title', 'type')
      .where('securityId', this.security.id)
  }

  private getTargetProgress = (factor: number) => {
    const progressLeft = this.targetProgress - this.startProgress
    return this.startProgress + progressLeft * factor
  }

  run = async (
    ticker: string,
    securitySyncEmitter?: SecuritySyncEmitter,
    targetProgress?: number
  ) => {
    const security = await Security.query(this.trx)
      .select('id')
      .findOne('ticker', ticker)
    if (!security) {
      throw new ApolloResourceNotFound(DefaultErrorCodes.RESOURCE_NOT_FOUND, {
        ticker,
      })
    }

    this.security = security
    this.securitySyncEmitter = securitySyncEmitter
    this.startProgress = this.securitySyncEmitter?.currentProgress ?? 0
    this.targetProgress = targetProgress ?? 0

    await this.setCurrentNews()
    securitySyncEmitter?.sendProgress(this.getTargetProgress(1 / 5))

    const newsList = await newsLink?.news(ticker)
    if (!newsList) return
    securitySyncEmitter?.sendProgress(this.getTargetProgress(2 / 5))

    const inputs = this.getNewsInputs(newsList)
    securitySyncEmitter?.watchTransactionProgress(
      inputs.length,
      News.tableName,
      targetProgress
    )
    const news = await News.query(this.trx)
      .upsertGraphAndFetch(inputs, {
        relate: true,
        noDelete: true,
      })
      .withGraphFetched('security')
    securitySyncEmitter?.clearWatchers()
    return news
  }

  getNewsInputs = (rawNews: SecurityNewsResult[]): Partial<News>[] => {
    const filterNews = (rn: SecurityNewsResult) =>
      !this.currentNews.find(
        (current) => current.title === rn.title && current.type === rn.type
      )
    return uniqBy(
      rawNews.filter(filterNews).map((rn) => ({
        ...omit(rn, 'ticker'),
        securityId: this.security.id,
      })),
      (rn) => `${rn.title}-${rn.type}`
    )
  }
}

export { NewsSyncMethod }
