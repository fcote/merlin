import { Card, List, Tag } from 'antd'
import React from 'react'

import { dayjs } from '@helpers/dayjs'

import { News } from '@lib/news'

import './NewsCard.style.less'

export type NewsCardProps = {
  news: News[]
  loading: boolean
  title: string
}

const NewsCard: React.FC<NewsCardProps> = ({ news, title }) => {
  const DateNode = (item: News): React.ReactNode => {
    const date = dayjs(item.date)

    return (
      <div className="news-date-container">
        <div className="news-date">{date.format('MMM DD')}</div>
        <div className="news-time">{date.format('HH:mm')}</div>
      </div>
    )
  }

  const ListItem = (item: News): React.ReactNode => {
    const WebsiteTag = () => {
      if (!item.website) return null
      return <Tag className="news-website">{item.website}</Tag>
    }
    const WebsiteLink = () => {
      if (!item.url) return item.title
      return (
        <a href={item.url} target="_blank" rel="noreferrer">
          {item.title}
        </a>
      )
    }

    return (
      <List.Item>
        <List.Item.Meta
          avatar={DateNode(item)}
          title={
            <div>
              {WebsiteTag()}
              {WebsiteLink()}
            </div>
          }
          description={item.content}
        />
      </List.Item>
    )
  }

  return (
    <Card className="security-news-card" title={title} bordered={false}>
      <List
        style={{ overflowX: 'hidden' }}
        itemLayout="horizontal"
        dataSource={news}
        renderItem={ListItem}
      />
    </Card>
  )
}

export default NewsCard
