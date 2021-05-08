import generatePicker from 'antd/es/date-picker/generatePicker'
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs'

import { dayjs } from '@helpers/dayjs'

const DatePicker = generatePicker<dayjs.Dayjs>(dayjsGenerateConfig)

export default DatePicker
