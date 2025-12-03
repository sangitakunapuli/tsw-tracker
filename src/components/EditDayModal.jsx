import React, { useState } from "react";
import "../css/EditDayModal.css";

function EditDayModal({ dayNumber, initial = { pain: null }, onClose, onSave, onClear }) {
  const [pain, setPain] = useState(initial?.pain ?? "");

  const handleSave = (e) => {
    e.preventDefault();
    const parsed = pain === "" ? null : Number(pain);
    onSave({ pain: parsed });
  };

  return (
    <div className="edm-backdrop" onClick={onClose}>
      <div className="edm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Day {dayNumber} — Pain</h3>
        <form onSubmit={handleSave} className="edm-form">
          <label>
            Pain (1-10)
            <select value={pain === null ? "" : pain} onChange={(e) => setPain(e.target.value)}>
              <option value="">--</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <div className="edm-actions">
            <button type="button" className="edm-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="edm-btn"
              onClick={() => {
                setPain("");
                onClear();
              }}
            >
              Clear
            </button>
            <button type="submit" className="edm-btn primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditDayModal;
