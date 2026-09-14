import { LoadingOutlined } from '@ant-design/icons'
import { Spin, Card, Tag } from 'antd'
import {
  AreaSeries,
  LineSeries,
  HistogramSeries,
  DeepPartial,
  ChartOptions,
  createChart,
  IChartApi,
  ISeriesApi,
  LineSeriesPartialOptions,
  AreaSeriesPartialOptions,
  HistogramSeriesPartialOptions,
  ColorType,
} from 'lightweight-charts'
import { debounce } from 'lodash'
import React, { useState, useRef, useEffect, CSSProperties } from 'react'

import { sma } from '@helpers/sma'

import useWindowSize, { Size } from '@hooks/useWindowSize'

import { HistoricalPrice } from '@lib/historicalPrice'

import './SecurityChart.style.less'

export type SecurityChartProps = {
  prices: HistoricalPrice[]
  loading: boolean
}

const chartConfig: DeepPartial<ChartOptions> = {
  layout: {
    background: {
      type: ColorType.Solid,
      color: 'transparent',
    },
    textColor: '#d1d4dc',
  },
  grid: {
    vertLines: {
      visible: false,
    },
    horzLines: {
      visible: false,
    },
  },
  rightPriceScale: {
    borderVisible: false,
  },
  timeScale: {
    visible: true,
    borderVisible: false,
  },
}

const upColor = '#4caf50'
const downColor = '#ff5252'
const sma50Color = '#138585'
const sma200Color = '#33bcb7'

const volumeChartConfig: DeepPartial<ChartOptions> = {
  ...chartConfig,
}

/*const priceCandlestickSeriesConfig: CandlestickSeriesPartialOptions = {
  upColor: upColor,
  downColor: downColor,
  wickUpColor: upColor,
  wickDownColor: downColor,
  borderVisible: false,
}*/

const priceAreaSeriesConfig: AreaSeriesPartialOptions = {
  topColor: upColor,
  bottomColor: 'transparent',
  lineColor: upColor,
  lineWidth: 3,
}

const volumeSeriesConfig: HistogramSeriesPartialOptions = {
  priceFormat: {
    type: 'volume',
  },
}

const smaSeriesConfig: LineSeriesPartialOptions = {
  lineWidth: 2,
  priceLineVisible: true,
}

const SecurityChart: React.FC<SecurityChartProps> = ({ prices, loading }) => {
  const windowSize = useWindowSize()
  const chartContainer = useRef<HTMLDivElement>(null)
  const [chartSize, setChartSize] = useState<Size>({
    width: undefined,
    height: undefined,
  })

  const priceChartViewRef = useRef<HTMLDivElement>(null)
  const [priceChart, setPriceChart] = useState<IChartApi>()
  const [priceSeries, setPriceSeries] = useState<ISeriesApi<'Area'>>()

  const volumeChartViewRef = useRef<HTMLDivElement>(null)
  const [volumeChart, setVolumeChart] = useState<IChartApi>()
  const [volumeSeries, setVolumeSeries] = useState<ISeriesApi<'Histogram'>>()

  const [sma50Series, setSma50Series] = useState<ISeriesApi<'Line'>>()
  const [sma50CurrentValue, setSma50CurrentValue] = useState<string>()
  const [sma200Series, setSma200Series] = useState<ISeriesApi<'Line'>>()
  const [sma200CurrentValue, setSma200CurrentValue] = useState<string>()

  useEffect(() => {
    const price = createChart(priceChartViewRef.current, chartConfig)
    const volume = createChart(volumeChartViewRef.current, volumeChartConfig)
    setPriceChart(price)
    setVolumeChart(volume)
    setPriceSeries(price.addSeries(AreaSeries, priceAreaSeriesConfig))
    setVolumeSeries(volume.addSeries(HistogramSeries, volumeSeriesConfig))
    setSma50Series(
      price.addSeries(LineSeries, { ...smaSeriesConfig, color: sma50Color })
    )
    setSma200Series(
      price.addSeries(LineSeries, { ...smaSeriesConfig, color: sma200Color })
    )
    return () => {
      price.remove()
      volume.remove()
    }
  }, [])

  useEffect(() => {
    priceSeries?.setData(
      prices.map((hp) => ({
        time: hp.date,
        value: hp.close,
      }))
    )
    sma50Series?.setData(sma(prices, 50))
    sma200Series?.setData(sma(prices, 200))
    volumeSeries?.setData(
      prices.map((hp) => ({
        time: hp.date,
        value: hp.volume * 1e6,
        color: hp.change > 0 ? upColor : downColor,
      }))
    )
  }, [prices, priceSeries, volumeSeries, sma50Series, sma200Series])

  useEffect(() => {
    if (!priceChart || !volumeChart || !sma50Series || !sma200Series) return
    const syncVolume = (range) => {
      if (range) volumeChart.timeScale().setVisibleLogicalRange(range)
    }
    const syncPrice = (range) => {
      if (range) priceChart.timeScale().setVisibleLogicalRange(range)
    }
    const updateIndicators = debounce((event) => {
      setSma50CurrentValue(event.seriesData.get(sma50Series)?.value?.toFixed(2))
      setSma200CurrentValue(
        event.seriesData.get(sma200Series)?.value?.toFixed(2)
      )
    }, 5)
    priceChart.timeScale().subscribeVisibleLogicalRangeChange(syncVolume)
    volumeChart.timeScale().subscribeVisibleLogicalRangeChange(syncPrice)
    priceChart.subscribeCrosshairMove(updateIndicators)
    return () => {
      priceChart.timeScale().unsubscribeVisibleLogicalRangeChange(syncVolume)
      volumeChart.timeScale().unsubscribeVisibleLogicalRangeChange(syncPrice)
      priceChart.unsubscribeCrosshairMove(updateIndicators)
      updateIndicators.cancel()
    }
  }, [priceChart, volumeChart, sma50Series, sma200Series])

  useEffect(() => {
    setChartSize({
      width: chartContainer?.current?.clientWidth,
      height: chartContainer?.current?.clientHeight,
    })
  }, [
    chartContainer?.current?.clientHeight,
    chartContainer?.current?.clientWidth,
    windowSize,
  ])

  useEffect(() => {
    if (!chartSize.width || !chartSize.height) return
    priceChart?.resize(chartSize.width, chartSize.height * 0.75)
    volumeChart?.resize(chartSize.width, chartSize.height * 0.25)
  }, [priceChart, volumeChart, chartSize])

  const IndicatorOverlay = ({
    name,
    value,
    color,
    style,
  }: {
    name: string
    value?: string
    color?: string
    style?: CSSProperties
  }) => {
    if (loading) return null
    return (
      <div className="chart-indicator" style={style}>
        <div className="chart-indicator-name">
          <Tag color={color}>{name}</Tag>
        </div>
        <div className="chart-indicator-value">{value}</div>
      </div>
    )
  }

  return (
    <Card className="security-chart-card" bordered={false}>
      <div ref={chartContainer} className="security-chart-container">
        <Spin
          indicator={<LoadingOutlined />}
          size="large"
          style={{
            display: loading ? 'block' : 'none',
            margin: '20% auto',
          }}
        />
        <IndicatorOverlay
          name="SMA 50"
          color={sma50Color}
          value={sma50CurrentValue}
        />
        <IndicatorOverlay
          name="SMA 200"
          color={sma200Color}
          value={sma200CurrentValue}
          style={{ marginTop: '35px' }}
        />
        <div
          id="security-price-chart"
          ref={priceChartViewRef}
          style={{
            display: loading ? 'none' : 'block',
          }}
        />
        <div
          id="security-volume-chart"
          ref={volumeChartViewRef}
          style={{
            display: loading ? 'none' : 'block',
          }}
        />
      </div>
    </Card>
  )
}

export { SecurityChart }
