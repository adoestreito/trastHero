"use client";

import { useState } from "react";
import { createLocation } from "@/lib/locations";
import type { StorageLocation } from "@/types/location";
import { btnPrimary, btnSecondary, inputClass } from "@/lib/ui";

type LocationSelectProps = {
  locations: StorageLocation[];
  value: string | null;
  onChange: (locationId: string | null) => void;
  onLocationCreated: (location: StorageLocation) => void;
  disabled?: boolean;
};

export function LocationSelect({
  locations,
  value,
  onChange,
  onLocationCreated,
  disabled,
}: LocationSelectProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleAddLocation = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setAdding(true);
    setAddError(null);
    try {
      const created = await createLocation(trimmed);
      onLocationCreated(created);
      onChange(created.id);
      setNewName("");
      setShowAdd(false);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Failed to add location");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-2">
      <select
        className={inputClass}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
      >
        <option value="">No location</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>

      {!showAdd ? (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          disabled={disabled}
          className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50"
        >
          + Add new location
        </button>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-[12rem] flex-1">
            <span className="mb-1 block text-xs font-medium text-muted">
              New location name
            </span>
            <input
              className={inputClass}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. estantería fondo"
              disabled={disabled || adding}
            />
          </label>
          <button
            type="button"
            onClick={handleAddLocation}
            disabled={disabled || adding || !newName.trim()}
            className={`${btnPrimary} !text-xs`}
          >
            {adding ? "Adding…" : "Save location"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAdd(false);
              setNewName("");
              setAddError(null);
            }}
            disabled={adding}
            className={`${btnSecondary} !text-xs`}
          >
            Cancel
          </button>
        </div>
      )}

      {addError && (
        <p className="text-xs text-danger">{addError}</p>
      )}
    </div>
  );
}
