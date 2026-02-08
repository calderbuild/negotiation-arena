"use client";

import { useEffect, useState } from "react";
import { fetchInstances, SecondMeInstanceInfo } from "@/lib/api";

interface InstancePickerProps {
  label: string;
  color: "blue" | "emerald";
  selectedId: string;
  selectedName: string;
  onSelect: (id: string, name: string) => void;
}

export default function InstancePicker({
  label,
  color,
  selectedId,
  selectedName,
  onSelect,
}: InstancePickerProps) {
  const [instances, setInstances] = useState<SecondMeInstanceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    fetchInstances()
      .then((list) => {
        setInstances(list);
        if (list.length === 0) setManualMode(true);
      })
      .catch((err) => {
        setError(err.message);
        setManualMode(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const isBlue = color === "blue";
  const borderColor = isBlue ? "border-blue-500/15" : "border-emerald-500/15";
  const hoverBorder = isBlue ? "hover:border-blue-500/30" : "hover:border-emerald-500/30";
  const bgColor = isBlue ? "bg-blue-950/10" : "bg-emerald-950/10";

  const inputClass = `w-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 transition-colors`;

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">{label}</span>
        {!loading && (
          <button
            onClick={() => setManualMode(!manualMode)}
            className="text-[10px] text-zinc-600 hover:text-zinc-400 font-mono transition-colors"
          >
            {manualMode ? (instances.length > 0 ? "LIST" : "") : "MANUAL"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <span className="flex gap-0.5">
            <span className="thinking-dot w-1 h-1 rounded-full bg-zinc-500" />
            <span className="thinking-dot w-1 h-1 rounded-full bg-zinc-500" />
            <span className="thinking-dot w-1 h-1 rounded-full bg-zinc-500" />
          </span>
          Loading
        </div>
      ) : manualMode ? (
        <div className="space-y-2">
          {error && (
            <div className="text-[10px] text-amber-500/70 font-mono px-1">{error}</div>
          )}
          <input
            type="text"
            placeholder="Instance ID"
            value={selectedId}
            onChange={(e) => onSelect(e.target.value, selectedName)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Display name"
            value={selectedName}
            onChange={(e) => onSelect(selectedId, e.target.value)}
            className={inputClass}
          />
        </div>
      ) : (
        <select
          value={selectedId}
          onChange={(e) => {
            const inst = instances.find((i) => i.instance_id === e.target.value);
            onSelect(e.target.value, inst?.upload_name ?? "");
          }}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">选择实例...</option>
          {instances.map((inst) => (
            <option key={inst.instance_id} value={inst.instance_id}>
              {inst.upload_name} {inst.description ? `- ${inst.description.slice(0, 30)}` : ""}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
