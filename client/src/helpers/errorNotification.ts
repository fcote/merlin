import { notification } from 'antd'

const errorNotification = (message: string, description?: string) => {
  notification.error({
    message,
    description,
    placement: 'bottomRight',
  })
}

export default errorNotification
