import { useState, useEffect } from "react";
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

function getDaysInMonth(month, year) {
  if (month === 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
    return 29; // leap year
  }
  return daysInMonths[month];
}

function App() {
  // track selected month/year
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // calculate days in selected month
  const daysInThisMonth = getDaysInMonth(selectedMonth, selectedYear);

  // get the day of week that the month starts on (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();

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

  // initialize per-day entries from localStorage for selected month
  // each entry is { itching, flakiness, redness, pain, oozing, dryness, triggers, averageScore }
  const [entries, setEntries] = useState(() => {
    const arr = [];
    for (let i = 1; i <= daysInThisMonth; i++) {
      const key = `${selectedMonth + 1}-${i}-${selectedYear}`;
      const stored = window.localStorage.getItem(key);
      if (stored === null) {
        const init = { itching: null, flakiness: null, redness: null, pain: null, oozing: null, dryness: null, triggers: [], averageScore: null };
        window.localStorage.setItem(key, JSON.stringify(init));
        arr.push(init);
      } else {
        try {
          arr.push(JSON.parse(stored));
        } catch (e) {
          // fallback if stored value was invalid
          arr.push({ itching: null, flakiness: null, redness: null, pain: null, oozing: null, dryness: null, triggers: [], averageScore: null });
        }
      }
    }
    return arr;
  });

  const daysCompleted = entries.filter((e) => e && e.averageScore != null).length;

  // reload entries when month/year changes
  useEffect(() => {
    const arr = [];
    for (let i = 1; i <= daysInThisMonth; i++) {
      const key = `${selectedMonth + 1}-${i}-${selectedYear}`;
      const stored = window.localStorage.getItem(key);
      if (stored === null) {
        const init = { itching: null, flakiness: null, redness: null, pain: null, oozing: null, dryness: null, triggers: [], averageScore: null };
        window.localStorage.setItem(key, JSON.stringify(init));
        arr.push(init);
      } else {
        try {
          arr.push(JSON.parse(stored));
        } catch (e) {
          // fallback if stored value was invalid
          arr.push({ itching: null, flakiness: null, redness: null, pain: null, oozing: null, dryness: null, triggers: [], averageScore: null });
        }
      }
    }
    setEntries(arr);
  }, [selectedMonth, selectedYear, daysInThisMonth]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleToday = () => {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  };


  // open modal to edit the day (only today or earlier for current month)
  const [editingDay, setEditingDay] = useState(null);

  const handleDayClick = (dayNumber) => {
    // allow editing past months and current month up to today
    // disable future months/dates
    if (!dayNumber) return;
    
    // check if viewing a future month
    if (selectedYear > currentYear) return;
    if (selectedYear === currentYear && selectedMonth > currentMonth) return;
    
    // for current month, only allow up to today
    if (selectedMonth === currentMonth && selectedYear === currentYear && dayNumber > currentDate) return;
    
    setEditingDay(dayNumber);
  };

  const saveDayData = (dayNumber, data) => {
    const index = dayNumber - 1;
    setEntries((prev) => {
      const next = [...prev];
      next[index] = data;
      const key = `${selectedMonth + 1}-${dayNumber}-${selectedYear}`;
      window.localStorage.setItem(key, JSON.stringify(next[index]));
      return next;
    });
    setEditingDay(null);
  };

  const clearDayData = (dayNumber) => {
    const index = dayNumber - 1;
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { itching: null, flakiness: null, redness: null, pain: null, oozing: null, dryness: null, triggers: [], averageScore: null };
      const key = `${selectedMonth + 1}-${dayNumber}-${selectedYear}`;
      window.localStorage.setItem(key, JSON.stringify(next[index]));
      return next;
    });
    setEditingDay(null);
  };

  const handleReset = () => {
    const next = Array.from({ length: daysInThisMonth }, () => ({ itching: null, flakiness: null, redness: null, pain: null, oozing: null, dryness: null, triggers: [], averageScore: null }));
    for (let i = 1; i <= daysInThisMonth; i++) {
      const key = `${selectedMonth + 1}-${i}-${selectedYear}`;
      window.localStorage.setItem(key, JSON.stringify({ itching: null, flakiness: null, redness: null, pain: null, oozing: null, dryness: null, triggers: [], averageScore: null }));
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
      <h1 id="title">{months[selectedMonth]} {selectedYear}</h1>
      <h2 id="subtitle">Continue on... you are a warrior.</h2>

      <div id="calendarContainer">
        <div id="calendarDiv">
          

          <div id="calendarHeading">
            <p id="habitTitle">
              TSW Tracker
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

                    const entry = entries[dayNumber - 1] || { averageScore: null };
                    const isToday = selectedMonth === currentMonth && selectedYear === currentYear && dayNumber === currentDate;
                    const isDisabled = 
                      selectedYear > currentYear || 
                      (selectedYear === currentYear && selectedMonth > currentMonth) ||
                      (selectedMonth === currentMonth && selectedYear === currentYear && dayNumber > currentDate);

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
                        {entry && entry.averageScore != null && (
                          <span
                            className="pain-badge"
                            style={{
                              background: painColor(entry.averageScore),
                            }}
                          >
                            {Math.round(entry.averageScore)}
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
      <div id="monthNavigation">
            <button onClick={handlePrevMonth}>← Previous</button>
            <button onClick={handleToday}>Today</button>
            <button onClick={handleNextMonth}>Next →</button>
          </div>
      {/* <button id="resetButton" onClick={handleReset}>
        Reset Button
      </button> */}
    </>
  );
}

export default App;
