import { Transaction } from 'objection'

import { RequestContext } from '@typings/context'

export abstract class Service {
  public trx?: Transaction

  constructor(public ctx: RequestContext) {
    this.trx = ctx.trx
  }
}

export abstract class ServiceMethod {
  public ctx: RequestContext
  public trx?: Transaction

  constructor(protected service: Service) {
    this.ctx = service.ctx
    this.trx = service.trx
  }

  run: (...args: any[]) => Promise<any>
}
