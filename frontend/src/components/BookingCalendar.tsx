import { FormEvent, useMemo, useState } from "react";
import { request } from "../api";
import { Booking, Resource, User } from "../types";

interface BookingCalendarProps {
  users: User[];
  resources: Resource[];
  bookings: Booking[];
  onCreate: () => Promise<void>;
}

export function BookingCalendar({ users, resources, bookings, onCreate }: BookingCalendarProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [purpose, setPurpose] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [bookings]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");

    try {
      await request<Booking>("/bookings", {
        method: "POST",
        headers: {
          "x-actor-user-id": selectedUserId
        },
        body: JSON.stringify({
          user_id: Number(selectedUserId),
          resource_id: Number(selectedResourceId),
          recurring_rule_id: null,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString(),
          purpose,
          status
        })
      });
      await onCreate();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Booking creation failed");
    }
  }

  return (
    <section aria-labelledby="booking-title" className="rounded-2xl bg-white/90 p-5 shadow-lg">
      <h2 id="booking-title" className="text-xl font-semibold text-slate-900">Booking Calendar</h2>
      <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          User
          <select className="input" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} required>
            <option value="">Select user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Resource
          <select className="input" value={selectedResourceId} onChange={(event) => setSelectedResourceId(event.target.value)} required>
            <option value="">Select resource</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>{resource.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Start
          <input className="input" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          End
          <input className="input" type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:col-span-2">
          Purpose
          <input className="input" value={purpose} onChange={(event) => setPurpose(event.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:col-span-2">
          Status
          <input className="input" value={status} onChange={(event) => setStatus(event.target.value)} required />
        </label>
        <button type="submit" className="button-primary md:col-span-2">Create Booking</button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}

      <div className="mt-5 overflow-x-auto" role="region" aria-label="Upcoming bookings">
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">Upcoming bookings list</caption>
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="p-2">Resource</th>
              <th scope="col" className="p-2">Booked By</th>
              <th scope="col" className="p-2">Start</th>
              <th scope="col" className="p-2">End</th>
              <th scope="col" className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.map((booking) => (
              <tr key={booking.id} className="border-b border-slate-200">
                <td className="p-2">{booking.resource_name}</td>
                <td className="p-2">{booking.booked_by}</td>
                <td className="p-2">{new Date(booking.starts_at).toLocaleString()}</td>
                <td className="p-2">{new Date(booking.ends_at).toLocaleString()}</td>
                <td className="p-2">{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
