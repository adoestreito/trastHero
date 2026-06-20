"use client";

import { useEffect, useState } from "react";
import { createLocation, updateLocation } from "@/lib/locations";
import type { StorageLocation } from "@/types/location";
import { btnPrimary, btnSecondary, inputClass } from "@/lib/ui";

type LocationSelectProps = {
  locations: StorageLocation[];
  value: string | null;
  onChange: (locationId: string | null) => void;
  onLocationCreated: (location: StorageLocation) => void;
  onLocationUpdated: (location: StorageLocation) => void;
  disabled?: boolean;
};

export function LocationSelect({
  locations,
  value,
  onChange,
  onLocationCreated,
  onLocationUpdated,
  disabled,
}: LocationSelectProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState("");
  const [renameName, setRenameName] = useState("");
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);

  const selected = locations.find((loc) => loc.id === value) ?? null;

  useEffect(() => {
    if (!showRename) {
      setRenameName(selected?.name ?? "");
      setRenameError(null);
    }
  }, [selected?.id, selected?.name, showRename]);

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

  const handleRenameLocation = async () => {
    if (!selected) return;
    const trimmed = renameName.trim();
    if (!trimmed) return;
    if (trimmed === selected.name) {
      setShowRename(false);
      return;
    }

    setRenaming(true);
    setRenameError(null);
    try {
      const updated = await updateLocation(selected.id, trimmed);
      onLocationUpdated(updated);
      setShowRename(false);
    } catch (e) {
      setRenameError(
        e instanceof Error ? e.message : "Failed to rename location"
      );
    } finally {
      setRenaming(false);
    }
  };

  return (
    <div className="space-y-2">
      <select
        className={inputClass}
        value={value ?? ""}
        onChange={(e) => {
          onChange(e.target.value || null);
          setShowRename(false);
        }}
        disabled={disabled}
      >
        <option value="">No location</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {!showAdd && (
          <button
            type="button"
            onClick={() => {
              setShowAdd(true);
              setShowRename(false);
            }}
            disabled={disabled}
            className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50"
          >
            + Add location
          </button>
        )}
        {selected && !showRename && (
          <button
            type="button"
            onClick={() => {
              setShowRename(true);
              setShowAdd(false);
              setRenameName(selected.name);
            }}
            disabled={disabled}
            className="text-xs font-medium text-muted hover:text-foreground disabled:opacity-50"
          >
            Rename location
          </button>
        )}
      </div>

      {showAdd && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-background/40 p-3">
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
            {adding ? "Adding…" : "Save"}
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
          {addError && (
            <p className="w-full text-xs text-danger">{addError}</p>
          )}
        </div>
      )}

      {showRename && selected && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-background/40 p-3">
          <label className="min-w-[12rem] flex-1">
            <span className="mb-1 block text-xs font-medium text-muted">
              Location name
            </span>
            <input
              className={inputClass}
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              disabled={disabled || renaming}
            />
          </label>
          <button
            type="button"
            onClick={handleRenameLocation}
            disabled={disabled || renaming || !renameName.trim()}
            className={`${btnPrimary} !text-xs`}
          >
            {renaming ? "Saving…" : "Update all items"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowRename(false);
              setRenameName(selected.name);
              setRenameError(null);
            }}
            disabled={renaming}
            className={`${btnSecondary} !text-xs`}
          >
            Cancel
          </button>
          <p className="w-full text-xs text-muted">
            Renaming updates every item in this location.
          </p>
          {renameError && (
            <p className="w-full text-xs text-danger">{renameError}</p>
          )}
        </div>
      )}
    </div>
  );
}
