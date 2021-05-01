import { notification } from 'antd'

const successNotification = (message: string, description?: string) => {
  notification.success({
    message,
    description,
    placement: 'bottomRight',
  })
}

export default successNotification
