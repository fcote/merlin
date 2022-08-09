import { Col, Row } from 'antd'
import React, { useEffect, useState } from 'react'

import NewsCard from '@components/cards/NewsCard/NewsCard'

import { useNews, subscribeToMoreNews } from '@hooks/api/queries/useNews'

import { NewsType } from '@lib/news'
import { Security } from '@lib/security'

export type SecurityDetailNewsProps = {
  security: Security
}

const SecurityDetailNews: React.FC<SecurityDetailNewsProps> = ({
  security,
}) => {
  const [subscribed, setSubscribed] = useState<boolean>(false)

  const { news, getNews, loading, subscribeToMore } = useNews()

  useEffect(() => {
    if (!security) return

    const variables = {
      filters: {
        ticker: security.ticker,
      },
    }
    void getNews({
      variables,
    })
  }, [security])

  useEffect(() => {
    if (!subscribeToMore || subscribed || !security) return
    subscribeToMore?.(subscribeToMoreNews(security.ticker))
    setSubscribed(true)
  }, [news])

  return (
    <div className="security-detail-news" style={{ paddingBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <NewsCard
            title="News"
            news={news?.filter((n) => n.type === NewsType.standard)}
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <NewsCard
            title="Press release"
            news={news?.filter((n) => n.type === NewsType.pressRelease)}
            loading={loading}
          />
        </Col>
      </Row>
    </div>
  )
}

export default SecurityDetailNews
