export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission {
  if (!notificationsSupported()) return 'denied'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

/**
 * Shows a local notification. Routed through the service worker registration
 * when available since that renders more reliably on mobile PWAs; falls back
 * to the plain Notification constructor on desktop browsers.
 */
export async function sendNotification(title: string, options?: NotificationOptions): Promise<void> {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) {
        await reg.showNotification(title, options)
        return
      }
    }
    new Notification(title, options)
  } catch {
    // delivery isn't guaranteed across browsers — fail silently
  }
}
