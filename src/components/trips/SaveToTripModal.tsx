import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  FolderPlus,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Trip = {
  id: string;
  title: string;
};

type SaveStatus = {
  type: "success" | "error" | "info";
  message: string;
} | null;

type TripPlaceRow = {
  trip_id: string;
  trips?:
    | {
        user_id: string;
      }
    | {
        user_id: string;
      }[]
    | null;
};

type SaveToTripModalProps = {
  placeId: string | null;
  placeName?: string;
  isOpen: boolean;
  onClose: () => void;
};

export function SaveToTripModal({
  placeId,
  placeName,
  isOpen,
  onClose,
}: SaveToTripModalProps) {
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [savingToTrip, setSavingToTrip] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [tripPlaceMap, setTripPlaceMap] = useState<Record<string, boolean>>({});
  const [loadingTrips, setLoadingTrips] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserTrips = async () => {
      setLoadingTrips(true);
      setSaveStatus(null);
      setSelectedTripId(null);
      setTripPlaceMap({});
      setUserTrips([]);

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Failed to get user:", userError);
        setSaveStatus({
          type: "error",
          message: "Could not get user.",
        });
        setLoadingTrips(false);
        return;
      }

      const user = userData.user;

      if (!user) {
        setSaveStatus({
          type: "error",
          message: "You must be logged in to save a place to a trip.",
        });
        setLoadingTrips(false);
        return;
      }

      if (!placeId) {
        setSaveStatus({
          type: "error",
          message: "Could not identify this place.",
        });
        setLoadingTrips(false);
        return;
      }

      const [tripsRes, tripPlacesRes] = await Promise.all([
        supabase
          .from("trips")
          .select("id, title")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("trip_places")
          .select(
            `
            trip_id,
            trips!inner (
              user_id
            )
          `
          )
          .eq("place_id", placeId)
          .eq("trips.user_id", user.id),
      ]);

      if (tripsRes.error) {
        console.error("Failed to fetch trips:", tripsRes.error);
        setSaveStatus({
          type: "error",
          message: "Could not load your trips.",
        });
        setLoadingTrips(false);
        return;
      }

      if (tripPlacesRes.error) {
        console.error("Failed to fetch trip places:", tripPlacesRes.error);
        setSaveStatus({
          type: "error",
          message: "Could not check existing saved trips.",
        });
        setLoadingTrips(false);
        return;
      }

      const trips = (tripsRes.data as Trip[]) || [];
      const tripPlaces = (tripPlacesRes.data as TripPlaceRow[]) || [];

      const map: Record<string, boolean> = {};
      tripPlaces.forEach((item) => {
        map[item.trip_id] = true;
      });

      setTripPlaceMap(map);
      setUserTrips(trips);

      if (trips.length === 0) {
        setSaveStatus({
          type: "info",
          message: "You do not have any trips yet. Create one first.",
        });
      }

      setLoadingTrips(false);
    };

    fetchUserTrips();
  }, [isOpen, placeId]);

  const handleClose = () => {
    setUserTrips([]);
    setSavingToTrip(false);
    setSelectedTripId(null);
    setSaveStatus(null);
    setTripPlaceMap({});
    setLoadingTrips(false);
    onClose();
  };

  const handleSaveToTrip = async (tripId: string) => {
    if (!placeId) return;
    if (tripPlaceMap[tripId]) return;

    setSavingToTrip(true);
    setSaveStatus(null);
    setSelectedTripId(tripId);

    const { error } = await supabase.from("trip_places").insert({
      trip_id: tripId,
      place_id: placeId,
    });

    if (error) {
      console.error("Failed to save place to trip:", error);

      const message = error.message.toLowerCase();

      if (
        message.includes("duplicate") ||
        message.includes("unique") ||
        message.includes("trip_places_trip_id_place_id_key")
      ) {
        setSaveStatus({
          type: "error",
          message: "This place is already in that trip.",
        });
      } else {
        setSaveStatus({
          type: "error",
          message: "Could not save this place to the trip.",
        });
      }

      setSavingToTrip(false);
      return;
    }

    setTripPlaceMap((prev) => ({
      ...prev,
      [tripId]: true,
    }));

    setSaveStatus({
      type: "success",
      message: "Place added to trip successfully.",
    });

    setSavingToTrip(false);

    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl p-5 md:p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl font-semibold">Save to Trip</h3>
            {placeName && (
              <p className="text-sm text-muted-foreground mt-1">{placeName}</p>
            )}
          </div>

          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveStatus && (
          <div
            className={`mb-4 rounded-xl border px-3 py-2 text-sm flex items-center gap-2 ${
              saveStatus.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : saveStatus.type === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-border bg-muted text-muted-foreground"
            }`}
          >
            {saveStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : saveStatus.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <FolderPlus className="w-4 h-4 shrink-0" />
            )}
            <span>{saveStatus.message}</span>
          </div>
        )}

        {loadingTrips ? (
          <p className="text-sm text-muted-foreground">Loading trips...</p>
        ) : userTrips.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You do not have any trips yet. Create one first.
            </p>
            <Link
              href="/trips"
              className="inline-flex text-sm font-medium text-primary hover:opacity-80"
            >
              Go to trips
            </Link>
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {userTrips.map((trip) => {
              const alreadyAdded = tripPlaceMap[trip.id];

              return (
                <button
                  key={trip.id}
                  onClick={() => !alreadyAdded && handleSaveToTrip(trip.id)}
                  disabled={savingToTrip || alreadyAdded}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors disabled:opacity-60 ${
                    alreadyAdded
                      ? "border-border bg-muted text-muted-foreground cursor-not-allowed"
                      : selectedTripId === trip.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  }`}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{trip.title}</span>

                    {alreadyAdded ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                        <Check className="w-3.5 h-3.5" />
                        Already added
                      </span>
                    ) : savingToTrip && selectedTripId === trip.id ? (
                      <span className="text-xs text-muted-foreground">
                        Saving...
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {saveStatus?.type === "success" && (
          <Link
            href="/trips"
            className="inline-flex mt-4 text-sm font-medium text-primary hover:opacity-80"
          >
            View my trips
          </Link>
        )}
      </div>
    </div>
  );
}