import { useEffect } from 'react'
import type { Debt, Expense, Settings } from '../types'
import { getPendingRecurring } from '../lib/recurring'
import { formatCurrency, todayISO } from '../lib/format'
import { getNotificationPermission, sendNotification } from '../lib/notifications'
import { shouldNotify, markNotified } from '../lib/reminders'

const RESEND_DAYS = 3

/** Checks budget, recurring-bill, and debt-due conditions and fires local notifications for any that need attention. */
export function useReminders(expenses: Expense[], debts: Debt[], settings: Settings) {
  useEffect(() => {
    if (!settings.notificationsEnabled) return
    if (getNotificationPermission() !== 'granted') return

    function run() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      const ymKey = `${year}-${month}`

      if (settings.budget != null && settings.budget > 0) {
        const monthTotal = expenses
          .filter((e) => !e.tripId)
          .filter((e) => {
            const d = new Date(`${e.date}T00:00:00`)
            return d.getFullYear() === year && d.getMonth() === month
          })
          .reduce((sum, e) => sum + e.amount, 0)
        const pct = (monthTotal / settings.budget) * 100
        const budgetLabel = formatCurrency(settings.budget, settings.currency)

        if (pct >= 100) {
          const key = `budget-over-${ymKey}`
          if (shouldNotify(key, RESEND_DAYS)) {
            sendNotification('Over budget', {
              body: `You've spent ${formatCurrency(monthTotal, settings.currency)} of your ${budgetLabel} budget this month.`,
              tag: key,
            })
            markNotified(key)
          }
        } else if (pct >= 90) {
          const key = `budget-90-${ymKey}`
          if (shouldNotify(key, RESEND_DAYS)) {
            sendNotification('Approaching your budget', {
              body: `You've used ${Math.round(pct)}% of this month's ${budgetLabel} budget.`,
              tag: key,
            })
            markNotified(key)
          }
        }
      }

      const pending = getPendingRecurring(expenses, year, month)
      if (pending.length > 0) {
        const key = `recurring-${ymKey}`
        if (shouldNotify(key, RESEND_DAYS)) {
          sendNotification(`${pending.length} recurring bill${pending.length === 1 ? '' : 's'} due`, {
            body: "Open Expensify to log this month's amounts.",
            tag: key,
          })
          markNotified(key)
        }
      }

      const today = todayISO()
      for (const debt of debts) {
        if (debt.settled || !debt.dueDate || debt.dueDate > today) continue
        const key = `debt-${debt.id}`
        if (!shouldNotify(key, RESEND_DAYS)) continue
        const overdue = debt.dueDate < today
        const amountLabel = formatCurrency(debt.amount, settings.currency)
        const body =
          debt.direction === 'i_owe' ? `You owe ${debt.person} ${amountLabel}.` : `${debt.person} owes you ${amountLabel}.`
        sendNotification(overdue ? 'Payment overdue' : 'Payment due today', { body, tag: key })
        markNotified(key)
      }
    }

    run()
    function onVisible() {
      if (document.visibilityState === 'visible') run()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [expenses, debts, settings])
}
