import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { config } from '@config'

dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(isoWeek)
dayjs.extend(quarterOfYear)
dayjs.extend(timezone)
dayjs.tz.setDefault(config.get('timezone'))

export { dayjs }
