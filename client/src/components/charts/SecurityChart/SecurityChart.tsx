import { LoadingOutlined } from '@ant-design/icons'
import { Spin, Card, Tag } from 'antd'
import {
  DeepPartial,
  ChartOptions,
  createChart,
  IChartApi,
  ISeriesApi,
  LineSeriesPartialOptions,
  AreaSeriesPartialOptions,
  HistogramSeriesPartialOptions,
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
    backgroundColor: 'transparent',
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
  const chartContainer = useRef<HTMLDivElement>()
  const [chartSize, setChartSize] = useState<Size>({
    width: undefined,
    height: undefined,
  })

  const priceChartViewRef = useRef()
  const [priceChart, setPriceChart] = useState<IChartApi>()
  const [priceSeries, setPriceSeries] = useState<ISeriesApi<'Area'>>()

  const volumeChartViewRef = useRef()
  const [volumeChart, setVolumeChart] = useState<IChartApi>()
  const [volumeSeries, setVolumeSeries] = useState<ISeriesApi<'Histogram'>>()

  const [sma50Series, setSma50Series] = useState<ISeriesApi<'Line'>>()
  const [sma50CurrentValue, setSma50CurrentValue] = useState<string>()
  const [sma200Series, setSma200Series] = useState<ISeriesApi<'Line'>>()
  const [sma200CurrentValue, setSma200CurrentValue] = useState<string>()

  const initPriceChart = () => {
    if (priceChart) return
    const newPriceChart = createChart(priceChartViewRef.current, chartConfig)
    const newSma50Series = newPriceChart.addLineSeries({
      ...smaSeriesConfig,
      color: sma50Color,
    })
    const newSma200Series = newPriceChart.addLineSeries({
      ...smaSeriesConfig,
      color: sma200Color,
    })
    const newPriceSeries = newPriceChart.addAreaSeries(priceAreaSeriesConfig)
    setPriceChart(newPriceChart)
    setPriceSeries(newPriceSeries)
    setSma50Series(newSma50Series)
    setSma200Series(newSma200Series)
  }

  const initVolumeChart = () => {
    if (volumeChart) return
    const newChart = createChart(volumeChartViewRef.current, volumeChartConfig)
    const newChartSeries = newChart.addHistogramSeries(volumeSeriesConfig)
    setVolumeChart(newChart)
    setVolumeSeries(newChartSeries)
  }

  const setIndicatorValue = (
    series: ISeriesApi<'Line'>,
    setValue: (value: string) => void
  ) =>
    debounce((event) => {
      const value = event.seriesPrices.get(series) as number
      setValue(value?.toFixed(2))
    }, 5)
  const setIndicatorSma50 = setIndicatorValue(sma50Series, setSma50CurrentValue)
  const setIndicatorSma200 = setIndicatorValue(
    sma200Series,
    setSma200CurrentValue
  )

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
  }, [prices])

  useEffect(() => {
    if (priceChartViewRef.current) initPriceChart()
    if (volumeChartViewRef.current) initVolumeChart()
  }, [priceChartViewRef, volumeChartViewRef])

  useEffect(() => {
    priceChart?.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      volumeChart?.timeScale().setVisibleLogicalRange(range)
    })
    priceChart?.subscribeCrosshairMove((event) => {
      setIndicatorSma50(event)
      setIndicatorSma200(event)
    })
    volumeChart?.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      priceChart?.timeScale().setVisibleLogicalRange(range)
    })
  }, [priceChart, volumeChart])

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
    priceChart?.resize(chartSize.width, chartSize.height * 0.75)
    volumeChart?.resize(chartSize.width, chartSize.height * 0.25)
  }, [priceChart, chartSize])

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
