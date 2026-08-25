"use client";

import { useState } from "react";

// The loadout, and the one thing on this page you can play with.
//
// Equipping a skill answers what a chip cloud never does: where the person
// actually used it. Everything reported is a cross-reference of entered data,
// computed in the template (see buildLoadout in LevelUpTemplate.js). No
// rating, no proficiency bar, no years-per-skill, because none of those exist
// in the entered data.
//
// A slot with nothing to cross-reference is not a button: an honest difference
// in affordance beats a third of the chips opening an empty drawer.
export default function LoadoutRack({ slots }) {
  const [equipped, setEquipped] = useState(null);
  const active = slots.find((slot) => slot.name === equipped) || null;

  return (
    <div className="lu-loadout">
      <ul className="lu-slots">
        {slots.map((slot) => {
          const total = slot.projects.length + slot.roles.length;
          const isOn = slot.name === equipped;
          const body = (
            <>
              <span className="lu-slot-dot" style={{ backgroundColor: slot.dot }} aria-hidden="true" />
              <span className="lu-slot-name">{slot.name}</span>
              {total > 0 && (
                <span className="lu-slot-count lu-pixel">
                  &times;{total}
                  <span className="lu-sr"> entries name this</span>
                </span>
              )}
            </>
          );
          return (
            <li key={slot.name}>
              {total > 0 ? (
                <button
                  type="button"
                  className={`lu-slot lu-slot-live lu-focus${isOn ? " lu-slot-on" : ""}`}
                  aria-pressed={isOn}
                  onClick={() => setEquipped(isOn ? null : slot.name)}
                >
                  {body}
                </button>
              ) : (
                <span className="lu-slot">{body}</span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Polite, not assertive: the panel is a result the visitor asked for
          by pressing a slot, so it should be read after the press is
          acknowledged rather than cutting in over it. */}
      <div className="lu-slot-detail" aria-live="polite">
        {active ? (
          <>
            <p className="lu-slot-detail-head lu-pixel">Equipped: {active.name}</p>
            {active.projects.length > 0 && (
              <p className="lu-slot-line">
                <span className="lu-slot-line-key">Projects that name it</span>
                {active.projects.join(", ")}
              </p>
            )}
            {active.roles.length > 0 && (
              <p className="lu-slot-line">
                <span className="lu-slot-line-key">Roles that name it</span>
                {active.roles.join("; ")}
              </p>
            )}
          </>
        ) : (
          <p className="lu-slot-hint">Equip a skill to see the projects and roles that name it.</p>
        )}
      </div>
    </div>
  );
}
