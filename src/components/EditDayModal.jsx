import React, { useState } from "react";
import "../css/EditDayModal.css";

function EditDayModal({ dayNumber, initial = { itching: null, flakiness: null, redness: null, pain: null, oozing: null, dryness: null, triggers: [], averageScore: null }, onClose, onSave, onClear }) {
  const [symptoms, setSymptoms] = useState({
    itching: initial?.itching ?? "",
    flakiness: initial?.flakiness ?? "",
    redness: initial?.redness ?? "",
    pain: initial?.pain ?? "",
    oozing: initial?.oozing ?? "",
    dryness: initial?.dryness ?? "",
  });

  const [selectedTriggers, setSelectedTriggers] = useState(initial?.triggers ?? []);

  const food_triggers = ["dairy", "gluten", "soy", "eggs", "nuts", "shellfish"];
  const environmental_triggers = ["pollen", "dust", "mold", "pet dander"];

  const handleTriggerClick = (trigger) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    const parsedSymptoms = Object.fromEntries(
      Object.entries(symptoms).map(([key, value]) => [key, value === "" ? null : Number(value)])
    );
    const averageScore =
      Object.values(parsedSymptoms).filter((v) => v !== null).reduce((a, b) => a + b, 0) /
      Object.values(parsedSymptoms).filter((v) => v !== null).length;
    onSave({ ...parsedSymptoms, triggers: selectedTriggers, averageScore });
  };

  const handleSliderChange = (symptom, value) => {
    setSymptoms((prev) => ({ ...prev, [symptom]: value }));
  };

  return (
    <div className="edm-backdrop" onClick={onClose}>
      <div className="edm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Day {dayNumber}</h3>
        <form onSubmit={handleSave} className="edm-form">
          {Object.keys(symptoms).map((symptom) => (
            <label key={symptom}>
              {symptom.charAt(0).toUpperCase() + symptom.slice(1)} (1-10)
              <input
                type="range"
                min="1"
                max="10"
                value={symptoms[symptom] === null ? "" : symptoms[symptom]}
                onChange={(e) => handleSliderChange(symptom, e.target.value)}
              />
            </label>
          ))}

          <div className="triggers-section">
            <h4>Food Triggers</h4>
            <div className="triggers">
              {food_triggers.map((trigger) => (
                <button
                  key={trigger}
                  type="button"
                  className={`trigger-btn ${selectedTriggers.includes(trigger) ? "selected" : ""}`}
                  onClick={() => handleTriggerClick(trigger)}
                >
                  {trigger}
                </button>
              ))}
            </div>

            <h4>Environmental Triggers</h4>
            <div className="triggers">
              {environmental_triggers.map((trigger) => (
                <button
                  key={trigger}
                  type="button"
                  className={`trigger-btn ${selectedTriggers.includes(trigger) ? "selected" : ""}`}
                  onClick={() => handleTriggerClick(trigger)}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>

          <div className="edm-actions">
            <button type="button" className="edm-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="edm-btn"
              onClick={() => {
                setSymptoms({ itching: "", flakiness: "", redness: "", pain: "", oozing: "", dryness: "" });
                setSelectedTriggers([]);
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
