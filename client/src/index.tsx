import { ConfigProvider, theme } from 'antd'
import 'antd/dist/reset.css'
import { Color } from './style/color'
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)
root.render(
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: Color.primary,
        colorError: Color.error,
        colorSuccess: Color.success,
        colorBgContainer: '#101010',
        colorLink: '#cccccc',
      },
    }}
  >
    <App />
  </ConfigProvider>
)
