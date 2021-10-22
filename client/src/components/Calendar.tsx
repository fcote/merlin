import generateCalendar from 'antd/es/calendar/generateCalendar'
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs'

import { dayjs } from '@helpers/dayjs'

const Calendar = generateCalendar<dayjs.Dayjs>(dayjsGenerateConfig)

export default Calendar
