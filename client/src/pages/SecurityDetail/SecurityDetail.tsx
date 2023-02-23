import {
  ExportOutlined,
  InfoCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { PageHeader } from '@ant-design/pro-layout'
import { Progress, Descriptions, Button, Tag, Modal, Layout } from 'antd'
import React, { useState, useMemo } from 'react'
import { useParams, Routes, useNavigate, Route } from 'react-router-dom'

import PrivateRoutes from '@components/PrivateRoutes'
import SecurityDetailMenu from '@components/menus/SecurityDetailMenu/SecurityDetailMenu'
import SecurityMetricTable from '@components/tables/SecurityMetricTable/SecurityMetricTable'

import { progressBarStrokeColor } from '@helpers/progressBarStrokeColor'

import useSecurityGetOrSync from '@hooks/api/mutations/useSecurityGetOrSync'
import { useDocumentTitle } from '@hooks/useDocumentTitle'

import SecurityDetailChart from '@pages/SecurityDetail/SecurityDetailChart'
import SecurityDetailEarnings from '@pages/SecurityDetail/SecurityDetailEarnings'
import SecurityDetailEstimates from '@pages/SecurityDetail/SecurityDetailEstimates'
import SecurityDetailNews from '@pages/SecurityDetail/SecurityDetailNews'
import SecurityDetailRatios from '@pages/SecurityDetail/SecurityDetailRatios'

import './SecurityDetail.style.less'
import SecurityDetailStatements from './SecurityDetailStatements'

export enum SecurityExternalSite {
  whalewisdom = 'whalewisdom',
  openinsider = 'openinsider',
  seekingalpha = 'seekingalpha',
  investorRelations = 'investorRelations',
}

const SecurityExternalSiteUrl: { [key: string]: string } = {
  [SecurityExternalSite.whalewisdom]: 'https://whalewisdom.com/stock/{ticker}',
  [SecurityExternalSite.openinsider]:
    'http://openinsider.com/screener?s={ticker}&fd=180',
  [SecurityExternalSite.seekingalpha]:
    'https://seekingalpha.com/symbol/{ticker}',
  [SecurityExternalSite.investorRelations]:
    'https://www.google.com/search?q={ticker}+investor+relations',
}

export interface SecurityDetailParams {
  [key: string]: string
  ticker: string
}

const SecurityDetail = () => {
  const { ticker } = useParams<SecurityDetailParams>()
  const navigate = useNavigate()
  useDocumentTitle(ticker)

  const { security, securitySyncProgress, securityLoading, syncSecurity } =
    useSecurityGetOrSync(ticker)

  const [
    isCompanyDescriptionModalVisible,
    setIsCompanyDescriptionModalVisible,
  ] = useState(false)

  useMemo(() => {
    if (!security?.type || security.type === 'commonStock') return

    navigate(
      { pathname: `/security/${security.ticker}/chart` },
      { replace: true }
    )
  }, [security])

  const handleExternalLink = (site: SecurityExternalSite) => {
    const baseUrl = SecurityExternalSiteUrl[site]
    const url = baseUrl.replace('{ticker}', security?.ticker)
    window.open(url, '_blank')
  }

  const SecuritySyncProgress = () => {
    if (!securitySyncProgress) return null
    return (
      <Progress
        strokeColor={progressBarStrokeColor}
        percent={securitySyncProgress}
      />
    )
  }

  const CompanyDescriptionModal = () => {
    return (
      <Modal
        width={640}
        title={security?.company?.name}
        closable={false}
        onCancel={() => setIsCompanyDescriptionModalVisible(false)}
        open={isCompanyDescriptionModalVisible}
        footer={null}
      >
        <Descriptions size="small" column={3} layout="vertical" colon={false}>
          <Descriptions.Item label={<Tag>{'Sector'}</Tag>}>
            {security?.company?.sector}
          </Descriptions.Item>
          <Descriptions.Item label={<Tag>{'Industry'}</Tag>}>
            {security?.company?.industry}
          </Descriptions.Item>
          <Descriptions.Item label={<Tag>{'Employees'}</Tag>}>
            {security?.company?.employees}
          </Descriptions.Item>
          <Descriptions.Item label={<Tag>{'Address'}</Tag>}>
            {security?.company?.address}
          </Descriptions.Item>
        </Descriptions>
        <Descriptions size="small" column={1} layout="vertical" colon={false}>
          <Descriptions.Item label={<Tag>{'Description'}</Tag>}>
            {security?.company?.description}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    )
  }

  const ExternalLinks = [
    <Button
      key="whale-wisdom"
      icon={<ExportOutlined />}
      onClick={() => handleExternalLink(SecurityExternalSite.whalewisdom)}
    >
      WhaleWisdom
    </Button>,
    <Button
      key="open-insider"
      icon={<ExportOutlined />}
      onClick={() => handleExternalLink(SecurityExternalSite.openinsider)}
    >
      Open Insider
    </Button>,
    <Button
      key="seeking-alpha"
      icon={<ExportOutlined />}
      onClick={() => handleExternalLink(SecurityExternalSite.seekingalpha)}
    >
      Seeking Alpha
    </Button>,
    <Button
      key="investor-relations"
      icon={<ExportOutlined />}
      onClick={() => handleExternalLink(SecurityExternalSite.investorRelations)}
    >
      Investor relations
    </Button>,
  ]

  const SecurityTitle = () => {
    if (!security) return ticker

    const companyName = security?.company ? ` (${security?.company?.name})` : ''

    return (
      <div>
        {`${security?.ticker}${companyName}`}
        {security?.company && (
          <Button
            icon={<InfoCircleOutlined />}
            type="text"
            onClick={() => setIsCompanyDescriptionModalVisible(true)}
            style={{ marginLeft: 8 }}
          />
        )}
        <Button
          icon={<SyncOutlined />}
          type="text"
          onClick={() => syncSecurity(security.ticker)}
          loading={securityLoading}
          style={{ marginLeft: 8 }}
        />
      </div>
    )
  }

  const SecurityMetrics = () => {
    if (securitySyncProgress || security?.type !== 'commonStock') return null

    return (
      <div className="security-metrics">
        <SecurityMetricTable
          security={security}
          securityLoading={securityLoading}
        />
      </div>
    )
  }

  const SecurityContent = useMemo(() => {
    if (securitySyncProgress) return null
    return (
      <Layout
        className="security-detail-content"
        style={{ height: 'calc(100% - 36px)' }}
      >
        <SecurityDetailMenu security={security} />
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route
              path="/statement/:freq"
              element={<SecurityDetailStatements security={security} />}
            />
            <Route
              path="/ratio/:freq"
              element={<SecurityDetailRatios security={security} />}
            />
            <Route
              path="/estimate/:freq"
              element={<SecurityDetailEstimates security={security} />}
            />
            <Route
              path="/chart"
              element={<SecurityDetailChart security={security} />}
            />
            <Route
              path="/earnings-calendar"
              element={<SecurityDetailEarnings security={security} />}
            />
            <Route
              path="/news"
              element={<SecurityDetailNews security={security} />}
            />
          </Route>
        </Routes>
      </Layout>
    )
  }, [securitySyncProgress, security])

  return (
    <Layout
      className="security-detail"
      style={{ height: 'calc(100% - 24px)' }}
      dir="vertical"
    >
      {CompanyDescriptionModal()}
      <PageHeader
        className="site-page-header"
        title={SecurityTitle()}
        extra={ExternalLinks}
      >
        {SecuritySyncProgress()}
      </PageHeader>
      {SecurityMetrics()}
      {SecurityContent}
    </Layout>
  )
}

export default SecurityDetail
