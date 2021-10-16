import { Popover, Row, Col } from 'antd'
import React, { useMemo } from 'react'

import { Color } from '@style/color'

import {
  FinancialPerformance,
  FinancialPerformanceGrade,
  FinancialPerformanceGradeBackgroundColor,
} from '@lib/financial'

import './FinancialPerformancePopover.style.less'

export type FinancialPerformancePopoverProps = {
  performance: FinancialPerformance
  children?: React.ReactNode
}

const FinancialPerformancePopover: React.FC<FinancialPerformancePopoverProps> =
  ({ performance, children }) => {
    const { backgroundColor } = useMemo(
      () => ({
        backgroundColor:
          FinancialPerformanceGradeBackgroundColor[performance?.grade] ??
          Color.primary,
      }),
      [performance]
    )
    const diffPercent = useMemo(
      () => (performance?.diffPercent * 100).toFixed(2),
      [performance]
    )

    const Content = (
      <div className="financial-performance-content">
        <Row gutter={8}>
          <Col span={6}>
            <div
              className="ratio-performance-grade"
              style={{ backgroundColor }}
            >
              {FinancialPerformanceGrade[performance?.grade]}
            </div>
          </Col>
          <Col span={18}>
            <div className="ratio-performance-sector">
              Sector: {performance?.sectorValue.toFixed(2)}
            </div>
            <div className="ratio-performance-diff">{diffPercent}%</div>
          </Col>
        </Row>
      </div>
    )

    return (
      <Popover
        key="financial-ratio-performance"
        content={Content}
        placement="rightTop"
        arrowPointAtCenter={true}
        destroyTooltipOnHide={{ keepParent: false }}
      >
        {children}
      </Popover>
    )
  }

export default FinancialPerformancePopover
