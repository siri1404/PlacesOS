import { FormEvent, useState } from "react";
import { request } from "../api";
import { Resource, ResourceType } from "../types";

interface AdminDashboardProps {
  actorUserId: string;
  resourceTypes: ResourceType[];
  resources: Resource[];
  onSync: () => Promise<void>;
}

export function AdminDashboard({ actorUserId, resourceTypes, resources, onSync }: AdminDashboardProps) {
  const [resourceTypeName, setResourceTypeName] = useState("");
  const [resourceTypeDescription, setResourceTypeDescription] = useState("");
  const [bookableWindowDays, setBookableWindowDays] = useState("");
  const [maxBookingMinutes, setMaxBookingMinutes] = useState("");

  const [resourceName, setResourceName] = useState("");
  const [resourceLocation, setResourceLocation] = useState("");
  const [resourceFloor, setResourceFloor] = useState("");
  const [resourceCapacity, setResourceCapacity] = useState("");
  const [resourceStatus, setResourceStatus] = useState("");
  const [resourceTypeId, setResourceTypeId] = useState("");
  const [error, setError] = useState("");

  async function createResourceType(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");

    try {
      await request<ResourceType>("/resource-types", {
        method: "POST",
        headers: {
          "x-actor-user-id": actorUserId
        },
        body: JSON.stringify({
          name: resourceTypeName,
          description: resourceTypeDescription,
          bookable_window_days: Number(bookableWindowDays),
          max_booking_minutes: Number(maxBookingMinutes)
        })
      });
      await onSync();
    } catch (resourceTypeError) {
      setError(resourceTypeError instanceof Error ? resourceTypeError.message : "Resource type creation failed");
    }
  }

  async function createResource(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");

    try {
      await request<Resource>("/resources", {
        method: "POST",
        headers: {
          "x-actor-user-id": actorUserId
        },
        body: JSON.stringify({
          name: resourceName,
          location: resourceLocation,
          floor: resourceFloor,
          capacity: Number(resourceCapacity),
          status: resourceStatus,
          metadata_json: {},
          resource_type_id: Number(resourceTypeId)
        })
      });
      await onSync();
    } catch (resourceError) {
      setError(resourceError instanceof Error ? resourceError.message : "Resource creation failed");
    }
  }

  return (
    <section aria-labelledby="admin-title" className="rounded-2xl bg-white/90 p-5 shadow-lg">
      <h2 id="admin-title" className="text-xl font-semibold text-slate-900">Admin Dashboard</h2>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <form onSubmit={createResourceType} className="grid gap-3 rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold">Create Resource Type</h3>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Type name
            <input className="input" value={resourceTypeName} onChange={(event) => setResourceTypeName(event.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Description
            <input className="input" value={resourceTypeDescription} onChange={(event) => setResourceTypeDescription(event.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Bookable window days
            <input className="input" value={bookableWindowDays} onChange={(event) => setBookableWindowDays(event.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Max booking minutes
            <input className="input" value={maxBookingMinutes} onChange={(event) => setMaxBookingMinutes(event.target.value)} required />
          </label>
          <button type="submit" className="button-primary">Save Resource Type</button>
        </form>

        <form onSubmit={createResource} className="grid gap-3 rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold">Create Resource</h3>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Resource name
            <input className="input" value={resourceName} onChange={(event) => setResourceName(event.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Location
            <input className="input" value={resourceLocation} onChange={(event) => setResourceLocation(event.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Floor
            <input className="input" value={resourceFloor} onChange={(event) => setResourceFloor(event.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Capacity
            <input className="input" value={resourceCapacity} onChange={(event) => setResourceCapacity(event.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Status
            <input className="input" value={resourceStatus} onChange={(event) => setResourceStatus(event.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Resource type
            <select className="input" value={resourceTypeId} onChange={(event) => setResourceTypeId(event.target.value)} required>
              <option value="">Select type</option>
              {resourceTypes.map((item) => (
                <option value={item.id} key={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="button-primary">Save Resource</button>
        </form>
      </div>

      {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">Managed resources</caption>
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="p-2">Name</th>
              <th scope="col" className="p-2">Location</th>
              <th scope="col" className="p-2">Type</th>
              <th scope="col" className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id} className="border-b border-slate-200">
                <td className="p-2">{resource.name}</td>
                <td className="p-2">{resource.location}</td>
                <td className="p-2">{resource.resource_type_name}</td>
                <td className="p-2">{resource.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
