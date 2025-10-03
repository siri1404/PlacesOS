import { useState } from "react";
import { request } from "../api";
import { AvailabilityGridItem } from "../types";

interface AvailabilityGridProps {
  resources: AvailabilityGridItem[];
  onLoad: (_startsAt: string, _endsAt: string) => Promise<void>;
}

export function AvailabilityGrid({ resources, onLoad }: AvailabilityGridProps) {
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function refreshGrid(): Promise<void> {
    setError("");
    setStatus("");
    try {
      await onLoad(new Date(startsAt).toISOString(), new Date(endsAt).toISOString());
      setStatus("Availability grid loaded.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Availability load failed");
    }
  }

  async function checkSingleResource(resourceId: number): Promise<void> {
    setError("");
    setStatus("");
    try {
      const response = await request<{ available: boolean }>(
        `/availability/resource/${resourceId}?starts_at=${encodeURIComponent(new Date(startsAt).toISOString())}&ends_at=${encodeURIComponent(new Date(endsAt).toISOString())}`
      );
      const message = response.available ? "available" : "not available";
      setStatus(`Resource ${resourceId} is ${message} for the selected time window.`);
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : "Resource check failed");
    }
  }

  return (
    <section aria-labelledby="availability-title" className="rounded-2xl bg-white/90 p-5 shadow-lg">
      <h2 id="availability-title" className="text-xl font-semibold text-slate-900">Availability Grid</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Start
          <input className="input" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          End
          <input className="input" type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} required />
        </label>
        <button className="button-primary self-end" onClick={() => void refreshGrid()} type="button">Load Grid</button>
      </div>

      {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
  {status ? <p role="status" aria-live="polite" className="mt-3 text-sm text-emerald-800">{status}</p> : null}

      <ul className="mt-4 grid gap-3 md:grid-cols-2" aria-live="polite">
        {resources.map((resource) => (
          <li
            key={resource.id}
            className={`rounded-xl border p-3 ${resource.available ? "border-emerald-400 bg-emerald-50" : "border-rose-400 bg-rose-50"}`}
          >
            <p className="font-semibold">{resource.name}</p>
            <p className="text-sm text-slate-700">{resource.location} | Floor {resource.floor}</p>
            <p className="text-sm text-slate-700">Capacity {resource.capacity}</p>
            <button className="mt-2 button-secondary" type="button" onClick={() => void checkSingleResource(resource.id)}>
              Check Exact
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
