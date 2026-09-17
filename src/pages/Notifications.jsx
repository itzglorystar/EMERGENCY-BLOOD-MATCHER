import NotificationsList from '../components/NotificationsList'
import { useApp } from '../context/AppContext'

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp()
  return (
    <NotificationsList
      notifications={notifications}
      onRead={markNotificationRead}
      onReadAll={markAllNotificationsRead}
    />
  )
}
