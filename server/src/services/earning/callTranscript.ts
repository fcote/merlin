import { earningsLink } from '@links/links'
import { Earning, EarningStatement } from '@models/earning'
import { ServiceMethod } from '@services/service'
import { ApolloResourceNotFound } from '@typings/errors/apolloErrors'

class EarningCallTranscriptMethod extends ServiceMethod {
  run = async (earningId: number | string): Promise<EarningStatement[]> => {
    const earning = await Earning.query(this.trx)
      .findById(earningId)
      .withGraphFetched('security')
    if (!earning) {
      throw new ApolloResourceNotFound('EARNING_NOT_FOUND')
    }
    if (earning.callTranscript) {
      return earning.callTranscript
    }

    const callTranscript = await earningsLink.earningCallTranscript(
      earning.security.ticker,
      earning.fiscalYear,
      earning.fiscalQuarter
    )
    if (!callTranscript) return null

    const parsedCallTranscript = Earning.parseCallTranscript(callTranscript)
    await earning
      .$query(this.trx)
      .patch({ callTranscript: JSON.stringify(parsedCallTranscript) })

    return parsedCallTranscript
  }
}

export { EarningCallTranscriptMethod }
