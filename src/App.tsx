import { useEffect, useState } from 'react'
import './App.css'

type Habit = {
  id: string
  name: string
  // Dates (YYYY-MM-DD) the habit was completed
  done: string[]
}

const STORAGE_KEY = 'habits'

function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// The last 7 days, oldest first, ending today
function lastWeek(): Date[] {
  const days: Date[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

// Consecutive days completed, counting back from today
// (or from yesterday, if today isn't checked off yet)
function streak(habit: Habit): number {
  const done = new Set(habit.done)
  const day = new Date()
  if (!done.has(toKey(day))) day.setDate(day.getDate() - 1)
  let count = 0
  while (done.has(toKey(day))) {
    count++
    day.setDate(day.getDate() - 1)
  }
  return count
}

function loadHabits(): Habit[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function App() {
  const [habits, setHabits] = useState<Habit[]>(loadHabits)
  const [newName, setNewName] = useState('')
  const days = lastWeek()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
  }, [habits])

  function addHabit(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setHabits([...habits, { id: crypto.randomUUID(), name, done: [] }])
    setNewName('')
  }

  function toggle(id: string, key: string) {
    setHabits(
      habits.map((h) =>
        h.id !== id
          ? h
          : {
              ...h,
              done: h.done.includes(key)
                ? h.done.filter((d) => d !== key)
                : [...h.done, key],
            },
      ),
    )
  }

  function remove(id: string) {
    setHabits(habits.filter((h) => h.id !== id))
  }

  return (
    <main className="app">
      <h1>Habit Tracker</h1>

      <form className="add" onSubmit={addHabit}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New habit, e.g. Drink water"
          aria-label="New habit"
        />
        <button type="submit">Add</button>
      </form>

      {habits.length === 0 ? (
        <p className="empty">No habits yet. Add one above to get started.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="name">Habit</th>
                {days.map((d) => (
                  <th key={toKey(d)}>
                    <span className="weekday">
                      {d.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span className="date">{d.getDate()}</span>
                  </th>
                ))}
                <th>Streak</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.id}>
                  <td className="name">{h.name}</td>
                  {days.map((d) => {
                    const key = toKey(d)
                    const checked = h.done.includes(key)
                    return (
                      <td key={key}>
                        <button
                          className={checked ? 'check on' : 'check'}
                          onClick={() => toggle(h.id, key)}
                          aria-label={`${h.name} on ${key}`}
                          aria-pressed={checked}
                        >
                          {checked ? '✓' : ''}
                        </button>
                      </td>
                    )
                  })}
                  <td className="streak">🔥 {streak(h)}</td>
                  <td>
                    <button
                      className="delete"
                      onClick={() => remove(h.id)}
                      aria-label={`Delete ${h.name}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

export default App
