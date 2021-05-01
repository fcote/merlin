import { Row, Col } from 'antd'
import { pick } from 'lodash'
import React from 'react'

import SelfAccountsCard from '@components/cards/SelfAccountsCard/SelfAccountsCard'
import SelfForecastCard from '@components/cards/SelfForecastCard/SelfForecastCard'
import SelfIncomeCard from '@components/cards/SelfIncomeCard/SelfIncomeCard'
import SelfMonthlyExpensesCard from '@components/cards/SelfMonthlyExpensesCard/SelfMonthlyExpensesCard'
import SelfMonthlyTotalsCard from '@components/cards/SelfMonthlyTotalsCard/SelfMonthlyTotalsCard'
import SelfPortfolioCard from '@components/cards/SelfPortfolioCard/SelfPortfolioCard'

import { useSelfHome } from '@hooks/api/queries/useSelfHome/useSelfHome'
import { SelfHomeQueryResponse } from '@hooks/api/queries/useSelfHome/useSelfHome.query'
import { useDocumentTitle } from '@hooks/useDocumentTitle'

const Home = () => {
  useDocumentTitle('Home')

  const { data: user, loading, refetch } = useSelfHome()

  const getIncome = (userData: SelfHomeQueryResponse) => {
    return pick(userData, [
      'incomePerYear',
      'incomeTaxRate',
      'salaryChargeRate',
      'incomePerMonthBeforeTaxes',
      'netIncomePerMonth',
    ])
  }

  return (
    <div className="home-content">
      <Row gutter={16}>
        <Col span={8}>
          <SelfIncomeCard
            currency={user?.currency}
            income={getIncome(user)}
            loading={loading}
            refetch={refetch}
          />
          <SelfMonthlyTotalsCard
            currency={user?.currency}
            monthlyTotals={user?.monthlyExpenses}
            loading={loading}
          />
          <SelfMonthlyExpensesCard
            currency={user?.currency}
            monthlyExpenses={user?.monthlyExpenseTransactions?.nodes}
            loading={loading}
            refetch={refetch}
          />
        </Col>
        <Col span={8}>
          <SelfAccountsCard
            currency={user?.currency}
            totalBalance={user?.accountTotalBalance}
            accounts={user?.accounts?.nodes}
            refetch={refetch}
            loading={loading}
          />
          <SelfForecastCard
            currency={user?.currency}
            monthlyForecast={user?.monthlyForecast}
            punctualTransactions={user?.punctualTransactions?.nodes}
            refetch={refetch}
            loading={loading}
          />
        </Col>
        <Col span={8}>
          <SelfPortfolioCard
            securities={user?.accountSecurities?.nodes}
            refetch={refetch}
            loading={loading}
          />
        </Col>
      </Row>
    </div>
  )
}

export default Home
