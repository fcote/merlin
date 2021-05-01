import reactRefresh from '@vitejs/plugin-react-refresh'
import path from 'path'
import { defineConfig } from 'vite'

import { Color } from './src/style/color'

const mapToFolder = (
  dependencies: string[],
  folder: string,
  replace: Record<string, string> = {}
) =>
  dependencies.reduce(
    (acc, dependency) => ({
      [dependency]: path.resolve(
        `${folder}/${replace[dependency] || dependency}`
      ),
      ...acc,
    }),
    {}
  )

export default defineConfig({
  server: {
    port: Number(process.env.PORT),
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'menu-dark-item-active-bg': '#444444',
          'primary-color': Color.primary,
          'error-color': Color.error,
          'success-color': Color.success,
          'component-background': '#101010',
          'link-color': '#cccccc',
          'skeleton-color': '#000000',
          'radio-button-focus-shadow': 'none',
          'animation-duration-slow': 0.01,
          'animation-duration-base': 0.01,
          'animation-duration-fast': 0.01,
        },
        javascriptEnabled: true,
      },
    },
  },
  build: {
    outDir: 'build',
    terserOptions: {
      parse: {
        ecma: 2020,
      },
      compress: {
        ecma: 5,
        comparisons: false,
        inline: 2,
        drop_console: true,
      },
      mangle: {
        safari10: true,
      },
      output: {
        ecma: 5,
        comments: false,
        ascii_only: true,
      },
    },
    chunkSizeWarningLimit: 2048,
  },
  plugins: [reactRefresh()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@helpers': path.resolve(__dirname, './src/helpers'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@config': path.resolve(__dirname, './src/config'),
      '@api': path.resolve(__dirname, './src/api'),
      '@style': path.resolve(__dirname, './src/style'),
      ...mapToFolder(['react', 'react-dom', '~antd'], './node_modules', {
        '~antd': 'antd',
      }),
    },
  },
})
