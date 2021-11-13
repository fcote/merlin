import { UserAccountSecurity } from '@models/userAccountSecurity'
import { RequestContext } from '@typings/context'

class SecurityProvider {
  constructor(
    protected userAccountId: string | number,
    protected userId: string,
    protected password: string,
    protected ctx: Partial<RequestContext>
  ) {}

  close = (): void => {
    return
  }

  connect: () => void
  getBalance: () => Promise<number | undefined>
  getAccountSecurities: () => Promise<Partial<UserAccountSecurity>[]>
}

export { SecurityProvider }
