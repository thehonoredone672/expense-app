import { useEffect, useRef, useState } from 'react'
import type { CategoryId, Debt, Expense, Trip } from './types'
import { useExpenses } from './hooks/useExpenses'
import { useTrips } from './hooks/useTrips'
import { useDebts } from './hooks/useDebts'
import { useSettings } from './hooks/useSettings'
import { useReminders } from './hooks/useReminders'
import { BottomNav, type Tab } from './components/BottomNav'
import { ExpenseForm } from './components/ExpenseForm'
import { TripForm } from './components/TripForm'
import { DebtForm } from './components/DebtForm'
import { Toast } from './components/Toast'
import { HomeScreen } from './screens/HomeScreen'
import { TripsScreen } from './screens/TripsScreen'
import { TripDetailScreen } from './screens/TripDetailScreen'
import { DebtsScreen } from './screens/DebtsScreen'
import { StatsScreen } from './screens/StatsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { getCurrencySymbol, todayISO } from './lib/format'
import { exportJSON, exportCSV, readBackupFile } from './lib/backup'
import type { PendingRecurring } from './lib/recurring'
import { haptic } from './lib/haptics'
import { useCelebration } from './hooks/useCelebration'
import { PixelSpark } from './components/PixelSpark'

export default function App() {
  const { expenses, addExpense, updateExpense, deleteExpense, clearAll, importExpenses, unassignTrip } =
    useExpenses()
  const { trips, addTrip, updateTrip, deleteTrip, importTrips } = useTrips()
  const { debts, addDebt, updateDebt, deleteDebt, setSettled, clearAll: clearAllDebts, importDebts } = useDebts()
  const { settings, updateSettings } = useSettings()

  useReminders(expenses, debts, settings)

  const [tab, setTab] = useState<Tab>('home')
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [addPresetCategory, setAddPresetCategory] = useState<CategoryId | undefined>(undefined)
  const [addPresetTripId, setAddPresetTripId] = useState<string | undefined>(undefined)

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [tripFormOpen, setTripFormOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)

  const [debtFormOpen, setDebtFormOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)

  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const celebration = useCelebration()

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('action') === 'add') {
      setEditing(null)
      setAddPresetCategory(undefined)
      setAddPresetTripId(undefined)
      setFormOpen(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function showToast(message: string) {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  function openAdd(presetCategory?: CategoryId) {
    setEditing(null)
    setAddPresetCategory(presetCategory)
    setAddPresetTripId(undefined)
    setFormOpen(true)
  }

  function openAddForTrip(tripId: string) {
    setEditing(null)
    setAddPresetCategory(undefined)
    setAddPresetTripId(tripId)
    setFormOpen(true)
  }

  function handleFabPress() {
    if (tab === 'trips') {
      if (selectedTripId) {
        openAddForTrip(selectedTripId)
      } else {
        setEditingTrip(null)
        setTripFormOpen(true)
      }
      return
    }
    if (tab === 'debts') {
      setEditingDebt(null)
      setDebtFormOpen(true)
      return
    }
    openAdd()
  }

  function openEdit(expense: Expense) {
    setEditing(expense)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
  }

  function handleSave(data: Omit<Expense, 'id' | 'createdAt'>) {
    if (editing) {
      updateExpense(editing.id, data)
    } else {
      addExpense(data)
      celebration.fire()
    }
    setFormOpen(false)
  }

  function handleDelete(id: string) {
    deleteExpense(id)
    if (editing?.id === id) setFormOpen(false)
  }

  function handleDuplicate(expense: Expense) {
    addExpense({
      amount: expense.amount,
      category: expense.category,
      note: expense.note,
      date: todayISO(),
      tripId: expense.tripId ?? null,
      recurring: false,
    })
    celebration.fire()
    showToast('Expense duplicated')
  }

  function handleMonthChange(y: number, m: number) {
    setYear(y)
    setMonth(m)
  }

  function handleAddRecurring(pending: PendingRecurring[]) {
    const today = todayISO()
    for (const p of pending) {
      addExpense({ amount: p.amount, category: p.category, note: p.note, date: today, tripId: null, recurring: true })
    }
    haptic('success')
    celebration.fire()
    showToast(`Added ${pending.length} recurring bill${pending.length === 1 ? '' : 's'}`)
  }

  function closeTripForm() {
    setTripFormOpen(false)
  }

  function handleSaveTrip(data: Omit<Trip, 'id' | 'createdAt'>) {
    if (editingTrip) {
      updateTrip(editingTrip.id, data)
    } else {
      addTrip(data)
      celebration.fire()
    }
    setTripFormOpen(false)
  }

  function handleDeleteTrip(id: string) {
    deleteTrip(id)
    unassignTrip(id)
    setTripFormOpen(false)
    if (selectedTripId === id) setSelectedTripId(null)
  }

  function openEditDebt(debt: Debt) {
    setEditingDebt(debt)
    setDebtFormOpen(true)
  }

  function closeDebtForm() {
    setDebtFormOpen(false)
  }

  function handleSaveDebt(data: Omit<Debt, 'id' | 'createdAt'>) {
    if (editingDebt) {
      updateDebt(editingDebt.id, data)
    } else {
      addDebt(data)
      celebration.fire()
    }
    setDebtFormOpen(false)
  }

  function handleDeleteDebt(id: string) {
    deleteDebt(id)
    if (editingDebt?.id === id) setDebtFormOpen(false)
  }

  function handleToggleSettled(debt: Debt) {
    haptic(debt.settled ? 'tick' : 'success')
    setSettled(debt.id, !debt.settled)
  }

  async function handleImportFile(file: File) {
    try {
      const imported = await readBackupFile(file)
      importExpenses(imported.expenses)
      importTrips(imported.trips)
      importDebts(imported.debts)
      const parts = []
      if (imported.expenses.length) parts.push(`${imported.expenses.length} expense${imported.expenses.length === 1 ? '' : 's'}`)
      if (imported.trips.length) parts.push(`${imported.trips.length} trip${imported.trips.length === 1 ? '' : 's'}`)
      if (imported.debts.length) parts.push(`${imported.debts.length} debt${imported.debts.length === 1 ? '' : 's'}`)
      showToast(`Imported ${parts.join(', ')}`)
    } catch {
      showToast('Could not read that file')
    }
  }

  function handleClearAll() {
    clearAll()
    clearAllDebts()
  }

  const activeTrip = selectedTripId ? (trips.find((t) => t.id === selectedTripId) ?? null) : null
  const formTripName = editing?.tripId
    ? trips.find((t) => t.id === editing.tripId)?.name
    : addPresetTripId
      ? trips.find((t) => t.id === addPresetTripId)?.name
      : undefined

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden border-[var(--border-hard)] bg-[var(--bg)] bg-dither text-[var(--text)] sm:my-4 sm:min-h-[calc(100dvh-2rem)] sm:border-2">
      <div key={tab} className="relative z-10 flex-1 overflow-y-auto animate-tab-in">
        {tab === 'home' && (
          <HomeScreen
            expenses={expenses}
            debts={debts}
            currency={settings.currency}
            budget={settings.budget}
            year={year}
            month={month}
            onMonthChange={handleMonthChange}
            onEdit={openEdit}
            onAdd={openAdd}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onAddRecurring={handleAddRecurring}
            onOpenDebts={() => setTab('debts')}
          />
        )}
        {tab === 'trips' && (
          <TripsScreen
            trips={trips}
            expenses={expenses}
            currency={settings.currency}
            onSelect={setSelectedTripId}
            onNewTrip={() => {
              setEditingTrip(null)
              setTripFormOpen(true)
            }}
          />
        )}
        {tab === 'debts' && (
          <DebtsScreen
            debts={debts}
            currency={settings.currency}
            onEdit={openEditDebt}
            onDelete={handleDeleteDebt}
            onToggleSettled={handleToggleSettled}
            onNewDebt={() => {
              setEditingDebt(null)
              setDebtFormOpen(true)
            }}
          />
        )}
        {tab === 'stats' && (
          <StatsScreen
            expenses={expenses}
            currency={settings.currency}
            year={year}
            month={month}
            onMonthChange={handleMonthChange}
          />
        )}
        {tab === 'settings' && (
          <SettingsScreen
            settings={settings}
            expenseCount={expenses.length}
            debtCount={debts.length}
            onUpdate={updateSettings}
            onClearAll={handleClearAll}
            onExportJSON={() => exportJSON(expenses, trips, debts, settings)}
            onExportCSV={() => exportCSV(expenses, trips)}
            onImportFile={handleImportFile}
          />
        )}
      </div>

      <BottomNav active={tab} onChange={setTab} onAdd={handleFabPress} />

      {activeTrip && (
        <TripDetailScreen
          trip={activeTrip}
          expenses={expenses}
          currency={settings.currency}
          onClose={() => setSelectedTripId(null)}
          onEditTrip={() => {
            setEditingTrip(activeTrip)
            setTripFormOpen(true)
          }}
          onAddExpense={() => openAddForTrip(activeTrip.id)}
          onEditExpense={openEdit}
          onDeleteExpense={handleDelete}
          onDuplicateExpense={handleDuplicate}
        />
      )}

      {tripFormOpen && (
        <TripForm
          initial={editingTrip}
          currencySymbol={getCurrencySymbol(settings.currency)}
          onClose={closeTripForm}
          onSave={handleSaveTrip}
          onDelete={handleDeleteTrip}
        />
      )}

      {debtFormOpen && (
        <DebtForm
          initial={editingDebt}
          currencySymbol={getCurrencySymbol(settings.currency)}
          onClose={closeDebtForm}
          onSave={handleSaveDebt}
          onDelete={handleDeleteDebt}
        />
      )}

      {formOpen && (
        <ExpenseForm
          initial={editing}
          presetCategory={addPresetCategory}
          presetTripId={addPresetTripId}
          tripName={formTripName}
          defaultDate={todayISO()}
          currencySymbol={getCurrencySymbol(settings.currency)}
          onClose={closeForm}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {toast && <Toast message={toast} />}

      {celebration.visible && (
        <div className="pointer-events-none absolute inset-x-0 top-[22%] z-50 flex justify-center">
          <PixelSpark key={celebration.key} />
        </div>
      )}
    </div>
  )
}
