import { useState } from "react";
import "./index.css";

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
const daysInThisMonth = daysInMonths[currentMonth];

// build 5x7 grid = 35 cells like your HTML
const GRID_SIZE = 35;
const gridDays = Array.from({ length: GRID_SIZE }, (_, idx) =>
  idx < daysInThisMonth ? idx + 1 : null
);

function App() {
  // habit title (click to change via prompt, like original)
  const [habitTitle, setHabitTitle] = useState("My New Habit");

  // initialize completion from localStorage
  const [completedDays, setCompletedDays] = useState(() => {
    const arr = [];
    for (let i = 1; i <= daysInThisMonth; i++) {
      const key = `${currentMonth + 1}-${i}-${currentYear}`;
      const stored = window.localStorage.getItem(key);
      if (stored === null) {
        window.localStorage.setItem(key, "false");
        arr.push(false);
      } else {
        arr.push(stored === "true");
      }
    }
    return arr;
  });

  const daysCompleted = completedDays.filter(Boolean).length;

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

  const handleDayClick = (dayNumber) => {
    // only allow today or earlier, and only real days
    if (!dayNumber || dayNumber > currentDate) return;

    const index = dayNumber - 1;
    const key = `${currentMonth + 1}-${dayNumber}-${currentYear}`;

    setCompletedDays((prev) => {
      const next = [...prev];
      const newValue = !next[index];
      next[index] = newValue;
      window.localStorage.setItem(key, newValue ? "true" : "false");
      return next;
    });
  };

  const handleReset = () => {
    const next = Array(daysInThisMonth).fill(false);
    for (let i = 1; i <= daysInThisMonth; i++) {
      const key = `${currentMonth + 1}-${i}-${currentYear}`;
      window.localStorage.setItem(key, "false");
    }
    setCompletedDays(next);
  };

  // break flat gridDays into 5 rows of 7
  const rows = [];
  for (let r = 0; r < 5; r++) {
    rows.push(gridDays.slice(r * 7, r * 7 + 7));
  }

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

                    const isCompleted = completedDays[dayNumber - 1];
                    const isToday = dayNumber === currentDate;

                    const style = {
                      backgroundColor: isCompleted ? "pink" : "white",
                      border: isToday ? "2px solid black" : undefined,
                      color: isToday ? "rgb(234, 1, 144)" : undefined,
                      cursor:
                        dayNumber <= currentDate ? "pointer" : "default",
                    };

                    return (
                      <div
                        key={colIndex}
                        className="day"
                        style={style}
                        onClick={() => handleDayClick(dayNumber)}
                      >
                        {dayNumber}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button id="resetButton" onClick={handleReset}>
        Reset Button
      </button>
    </>
  );
}

export default App;
