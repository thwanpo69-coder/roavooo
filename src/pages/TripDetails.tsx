import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  MapPin,
  Star,
  Trash2,
  CalendarDays,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type Trip = {
  id: string;
  user_id: string;
  title: string;
  city_id: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
};

type City = {
  id: string;
  slug: string;
  name: string;
};

type PlaceInfo = {
  id: string;
  name: string;
  image_url: string;
  rating: number;
  location: string | null;
  category: "stay" | "activity" | "restaurant";
};

type RawTripPlaceRow = {
  id: string;
  place_id: string;
  places: PlaceInfo | PlaceInfo[] | null;
};

type TripPlaceRow = {
  id: string;
  place_id: string;
  place: PlaceInfo | null;
};

export function TripDetails() {
  const [location, setLocation] = useLocation();
  const tripId = location.split("/trips/")[1];

  const [trip, setTrip] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<TripPlaceRow[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deletingTrip, setDeletingTrip] = useState(false);

  const [editing, setEditing] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [title, setTitle] = useState("");
  const [cityId, setCityId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const cityMap = useMemo(() => {
    return Object.fromEntries(cities.map((city) => [city.id, city]));
  }, [cities]);

  const fillFormFromTrip = (tripData: Trip) => {
    setTitle(tripData.title || "");
    setCityId(tripData.city_id || "");
    setStartDate(tripData.start_date || "");
    setEndDate(tripData.end_date || "");
    setNotes(tripData.notes || "");
  };

  const fetchTripDetails = async () => {
    setLoading(true);

    const [tripRes, placesRes, citiesRes] = await Promise.all([
      supabase.from("trips").select("*").eq("id", tripId).single(),
      supabase
        .from("trip_places")
        .select(
          `
          id,
          place_id,
          places (
            id,
            name,
            image_url,
            rating,
            location,
            category
          )
        `
        )
        .eq("trip_id", tripId),
      supabase.from("cities").select("id, slug, name").order("name", { ascending: true }),
    ]);

    if (tripRes.error) {
      console.error("Failed to fetch trip:", tripRes.error);
      setTrip(null);
      setPlaces([]);
      setLoading(false);
      return;
    }

    const tripData = tripRes.data as Trip;
    setTrip(tripData);
    fillFormFromTrip(tripData);

    if (placesRes.error) {
      console.error("Failed to fetch trip places:", placesRes.error);
      setPlaces([]);
    } else {
      const normalized: TripPlaceRow[] = ((placesRes.data as RawTripPlaceRow[]) || []).map(
        (item) => ({
          id: item.id,
          place_id: item.place_id,
          place: Array.isArray(item.places) ? item.places[0] ?? null : item.places,
        })
      );

      setPlaces(normalized);
    }

    if (citiesRes.error) {
      console.error("Failed to fetch cities:", citiesRes.error);
      setCities([]);
    } else {
      setCities((citiesRes.data as City[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!tripId) return;
    fetchTripDetails();
  }, [tripId]);

  const handleRemovePlace = async (tripPlaceId: string) => {
    setRemovingId(tripPlaceId);

    const { error } = await supabase
      .from("trip_places")
      .delete()
      .eq("id", tripPlaceId);

    if (error) {
      console.error("Failed to remove place from trip:", error);
      alert("Could not remove this place from the trip.");
      setRemovingId(null);
      return;
    }

    setPlaces((prev) => prev.filter((p) => p.id !== tripPlaceId));
    setRemovingId(null);
  };

  const handleSaveTrip = async () => {
    if (!trip) return;

    const cleanTitle = title.trim();
    const cleanNotes = notes.trim();

    if (!cleanTitle) {
      alert("Please enter a trip title.");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      alert("End date must be after start date.");
      return;
    }

    setSavingTrip(true);

    const { data, error } = await supabase
      .from("trips")
      .update({
        title: cleanTitle,
        city_id: cityId || null,
        start_date: startDate || null,
        end_date: endDate || null,
        notes: cleanNotes || null,
      })
      .eq("id", trip.id)
      .select("*")
      .single();

    if (error) {
      console.error("Failed to update trip:", error);
      alert("Could not update trip.");
      setSavingTrip(false);
      return;
    }

    const updatedTrip = data as Trip;
    setTrip(updatedTrip);
    fillFormFromTrip(updatedTrip);
    setEditing(false);
    setSavingTrip(false);
  };

  const handleCancelEdit = () => {
    if (!trip) return;
    fillFormFromTrip(trip);
    setEditing(false);
  };

  const handleDeleteTrip = async () => {
    if (!trip) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this trip? This will also remove all places saved inside it."
    );

    if (!confirmed) return;

    setDeletingTrip(true);

    const { error } = await supabase
      .from("trips")
      .delete()
      .eq("id", trip.id);

    if (error) {
      console.error("Failed to delete trip:", error);
      alert("Could not delete trip.");
      setDeletingTrip(false);
      return;
    }

    setDeletingTrip(false);
    setLocation("/trips");
  };

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading...</div>;
  }

  if (!trip) {
    return <div className="p-6 max-w-6xl mx-auto">Trip not found</div>;
  }

  const city = trip.city_id ? cityMap[trip.city_id] : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => setLocation("/trips")}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to trips
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6 mb-8">
        {!editing ? (
          <>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>

                {city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{city.name}</span>
                  </div>
                )}

                {(trip.start_date || trip.end_date) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span>
                      {trip.start_date || "No start date"} →{" "}
                      {trip.end_date || "No end date"}
                    </span>
                  </div>
                )}

                {trip.notes && (
                  <p className="text-muted-foreground mt-3">{trip.notes}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit trip
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDeleteTrip}
                  disabled={deletingTrip}
                  className="border-red-500/40 text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deletingTrip ? "Deleting..." : "Delete trip"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-2xl font-bold">Edit trip</h1>
              <button
                onClick={handleCancelEdit}
                className="text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Trip title"
                className="p-3 rounded-lg bg-muted border border-border outline-none"
              />

              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="p-3 rounded-lg bg-muted border border-border outline-none"
              >
                <option value="">Select a city (optional)</option>
                {cities.map((cityOption) => (
                  <option key={cityOption.id} value={cityOption.id}>
                    {cityOption.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-3 rounded-lg bg-muted border border-border outline-none"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-3 rounded-lg bg-muted border border-border outline-none"
              />
            </div>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Trip notes"
              className="w-full p-3 rounded-lg bg-muted border border-border outline-none resize-none mb-4"
            />

            <div className="flex gap-3">
              <Button onClick={handleSaveTrip} disabled={savingTrip}>
                <Save className="w-4 h-4 mr-2" />
                {savingTrip ? "Saving..." : "Save changes"}
              </Button>

              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>

      {places.length === 0 ? (
        <div className="rounded-xl border border-border p-6 bg-card">
          <p className="text-muted-foreground">
            No places added to this trip yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {places.map((item) => {
            const place = item.place;

            if (!place) {
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <p className="text-muted-foreground">
                    This place could not be loaded.
                  </p>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <Link href={`/place/${place.id}`}>
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-52 object-cover cursor-pointer"
                  />
                </Link>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <Link href={`/place/${place.id}`}>
                        <h2 className="text-xl font-semibold hover:text-primary transition-colors cursor-pointer">
                          {place.name}
                        </h2>
                      </Link>

                      <p className="text-sm text-muted-foreground capitalize mt-1">
                        {place.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-sm font-semibold bg-muted px-2.5 py-1.5 rounded-lg shrink-0">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span>{place.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{place.location || "No location"}</span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleRemovePlace(item.id)}
                    disabled={removingId === item.id}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {removingId === item.id ? "Removing..." : "Remove from trip"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}