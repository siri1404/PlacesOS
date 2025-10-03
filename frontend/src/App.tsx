import { useCallback, useEffect, useState } from "react";
import { request } from "./api";
import { AdminDashboard } from "./components/AdminDashboard";
import { AvailabilityGrid } from "./components/AvailabilityGrid";
import { BookingCalendar } from "./components/BookingCalendar";
import { AvailabilityGridItem, Booking, Resource, ResourceType, User } from "./types";

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<AvailabilityGridItem[]>([]);
  const [actorUserId, setActorUserId] = useState("");
  const [statusMessage, setStatusMessage] = useState("Loading workspace data...");

  const syncCoreData = useCallback(async () => {
    try {
      const [loadedUsers, loadedResources, loadedResourceTypes, loadedBookings] = await Promise.all([
        request<User[]>("/users"),
        request<Resource[]>("/resources"),
        request<ResourceType[]>("/resource-types"),
        request<Booking[]>("/bookings")
      ]);

      setUsers(loadedUsers);
      setResources(loadedResources);
      setResourceTypes(loadedResourceTypes);
      setBookings(loadedBookings);
      setStatusMessage("Data synchronized");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Data sync failed");
    }
  }, []);

  const loadAvailability = useCallback(async (startsAt: string, endsAt: string) => {
    try {
      const loadedGrid = await request<AvailabilityGridItem[]>(
        `/availability/grid?starts_at=${encodeURIComponent(startsAt)}&ends_at=${encodeURIComponent(endsAt)}`
      );
      setAvailability(loadedGrid);
      setStatusMessage("Availability updated");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Availability update failed");
      throw error;
    }
  }, []);

  useEffect(() => {
    void syncCoreData();
  }, [syncCoreData]);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <main id="main-content" className="min-h-screen bg-aurora p-4 text-slate-900 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur">
          <h1 className="text-3xl font-bold tracking-tight">PlacesOS Workplace Resource Platform</h1>
          <p className="mt-2 text-slate-700">Resource booking, availability, and administration driven by a live REST API.</p>
          <div className="mt-4 flex flex-col gap-2 md:max-w-md">
            <label htmlFor="actor-user" className="text-sm font-medium">Actor User ID for Admin Actions</label>
            <input
              id="actor-user"
              className="input"
              value={actorUserId}
              onChange={(event) => setActorUserId(event.target.value)}
              aria-describedby="actor-help"
            />
            <p id="actor-help" className="text-xs text-slate-600">Use an existing user id. Admin mutations require x-actor-user-id.</p>
          </div>
          <p className="mt-3 text-sm text-emerald-800" role="status" aria-live="polite">{statusMessage}</p>
          </header>

          <section aria-label="Workplace operations" className="grid gap-6">
            <BookingCalendar users={users} resources={resources} bookings={bookings} onCreate={syncCoreData} />
            <AvailabilityGrid resources={availability} onLoad={loadAvailability} />
            <AdminDashboard
              actorUserId={actorUserId}
              resourceTypes={resourceTypes}
              resources={resources}
              onSync={syncCoreData}
            />
          </section>
        </div>
      </main>
    </>
  );
}
