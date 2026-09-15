interface UserFilters {
  username?: string
  apiToken?: string
  userId?: string
}

class SignInFields {
  username: string

  password: string
}

class SignUpFields {
  username: string

  password: string
}

class UserFields {
  username: string

  currency: string

  incomePerYear: number

  incomeTaxRate: number

  salaryChargeRate: number

  id: string
}

export { UserFilters, SignInFields, SignUpFields, UserFields }
