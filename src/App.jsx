import { useState } from "react";
import "./index.css";
import EditDayModal from "./components/EditDayModal";
import "./css/EditDayModal.css";

// helper to map pain (1-10) to a color
function painColor(pain) {
  if (pain == null) return "#999";
  const p = Number(pain);
  if (p <= 2) return "#2ecc71"; // green
  if (p <= 4) return "#9be564"; // light green
  if (p <= 6) return "#f1c40f"; // yellow
  if (p <= 8) return "#f39c12"; // orange
  return "#e74c3c"; // red
}

// same date logic as your original script
const today = new Date();
const currentMonth = today.getMonth();
const currentDate = today.getDate();
const currentYear = today.getFullYear();

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
let daysInThisMonth = daysInMonths[currentMonth];

// handle leap years
if (currentMonth === 1 && ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0)) {
  daysInThisMonth = 29;
}

// get the day of week that the month starts on (0 = Sunday, 6 = Saturday)
const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

// build calendar grid with proper alignment
const gridDays = [];
// add empty cells for days before the month starts
for (let i = 0; i < firstDayOfMonth; i++) {
  gridDays.push(null);
}
// add all days of the month
for (let i = 1; i <= daysInThisMonth; i++) {
  gridDays.push(i);
}

function App() {
  // habit title (click to change via prompt, like original)
  const [habitTitle, setHabitTitle] = useState("My New Habit");

  // initialize per-day entries from localStorage
  // each entry is { pain: number | null }
  const [entries, setEntries] = useState(() => {
    const arr = [];
    for (let i = 1; i <= daysInThisMonth; i++) {
      const key = `${currentMonth + 1}-${i}-${currentYear}`;
      const stored = window.localStorage.getItem(key);
      if (stored === null) {
        const init = { pain: null };
        window.localStorage.setItem(key, JSON.stringify(init));
        arr.push(init);
      } else {
        try {
          arr.push(JSON.parse(stored));
        } catch (e) {
          // fallback if stored value was plain boolean
          arr.push({ pain: null });
        }
      }
    }
    return arr;
  });

  const daysCompleted = entries.filter((e) => e && e.pain != null).length;

  const handleHabitClick = () => {
    const result = window.prompt("What's your habit?", habitTitle);
    if (result === null) return; // user hit cancel

    const trimmed = result.trim();
    if (trimmed.length === 0) {
      setHabitTitle("Click to set your habit");
    } else {
      setHabitTitle(trimmed);
    }
  };

  // open modal to edit the day's pain (only today or earlier)
  const [editingDay, setEditingDay] = useState(null);

  const handleDayClick = (dayNumber) => {
    if (!dayNumber || dayNumber > currentDate) return;
    setEditingDay(dayNumber);
  };

  const saveDayData = (dayNumber, { pain }) => {
    const index = dayNumber - 1;
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { pain: pain == null ? null : Number(pain) };
      const key = `${currentMonth + 1}-${dayNumber}-${currentYear}`;
      window.localStorage.setItem(key, JSON.stringify(next[index]));
      return next;
    });
    setEditingDay(null);
  };

  const clearDayData = (dayNumber) => {
    const index = dayNumber - 1;
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { pain: null };
      const key = `${currentMonth + 1}-${dayNumber}-${currentYear}`;
      window.localStorage.setItem(key, JSON.stringify(next[index]));
      return next;
    });
    setEditingDay(null);
  };

  const handleReset = () => {
    const next = Array.from({ length: daysInThisMonth }, () => ({ pain: null }));
    for (let i = 1; i <= daysInThisMonth; i++) {
      const key = `${currentMonth + 1}-${i}-${currentYear}`;
      window.localStorage.setItem(key, JSON.stringify({ pain: null }));
    }
    setEntries(next);
  };

  // break flat gridDays into 5 rows of 7
  const rows = [];
  for (let r = 0; r < 5; r++) {
    rows.push(gridDays.slice(r * 7, r * 7 + 7));
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <h1 id="title">{months[currentMonth]}</h1>
      <h2 id="subtitle">Monthly Habit Tracker</h2>

      <div id="calendarContainer">
        <div id="calendarDiv">
          <div id="calendarHeading">
            <p id="habitTitle" onClick={handleHabitClick}>
              {habitTitle}
            </p>
            <p id="totalDays">
              {daysCompleted}/{daysInThisMonth}
            </p>
          </div>

          <div id="calendarContent">
            <div id="tracker">
              <div id="weekdaysHeader">
                {weekdays.map((day) => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>
              {rows.map((row, rowIndex) => (
                <div className="days" key={rowIndex}>
                  {row.map((dayNumber, colIndex) => {
                    if (!dayNumber) {
                      return (
                        <div className="day" key={colIndex}>
                          {/* blank cell */}
                        </div>
                      );
                    }

                    const entry = entries[dayNumber - 1] || { pain: null };
                    const isToday = dayNumber === currentDate;
                    const isDisabled = dayNumber > currentDate;

                    return (
                      <div
                        key={colIndex}
                        className="day"
                        data-disabled={isDisabled}
                        style={{
                          ...(isToday && {
                            border: "3px solid rgb(234, 1, 144)",
                            background: "rgba(255, 192, 203, 0.2)",
                          }),
                        }}
                        onClick={() => handleDayClick(dayNumber)}
                      >
                        {dayNumber}
                        {entry && entry.pain != null && (
                          <span
                            className="pain-badge"
                            style={{
                              background: painColor(entry.pain),
                            }}
                          >
                            {entry.pain}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {editingDay && (
        <EditDayModal
          dayNumber={editingDay}
          initial={entries[editingDay - 1]}
          onClose={() => setEditingDay(null)}
          onSave={(data) => saveDayData(editingDay, data)}
          onClear={() => clearDayData(editingDay)}
        />
      )}
      <button id="resetButton" onClick={handleReset}>
        Reset Button
      </button>
    </>
  );
}

export default App;
