import { useEffect, useState } from "react";
import { Link } from "wouter";
import { FolderPlus, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type Trip = {
  id: string;
  title: string;
};

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
  const { toast } = useToast();

  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [savingToTrip, setSavingToTrip] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [tripPlaceMap, setTripPlaceMap] = useState<Record<string, boolean>>({});
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [hasNoTrips, setHasNoTrips] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserTrips = async () => {
      setLoadingTrips(true);
      setSelectedTripId(null);
      setTripPlaceMap({});
      setUserTrips([]);
      setHasNoTrips(false);

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Failed to get user:", userError);
        toast({
          variant: "destructive",
          title: "Could not get user",
          description: "Please try again.",
        });
        setLoadingTrips(false);
        onClose();
        return;
      }

      const user = userData.user;

      if (!user) {
        toast({
          variant: "destructive",
          title: "Login required",
          description: "You must be logged in to save a place to a trip.",
        });
        setLoadingTrips(false);
        onClose();
        return;
      }

      if (!placeId) {
        toast({
          variant: "destructive",
          title: "Place not found",
          description: "Could not identify this place.",
        });
        setLoadingTrips(false);
        onClose();
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
        toast({
          variant: "destructive",
          title: "Could not load trips",
          description: "Please try again.",
        });
        setLoadingTrips(false);
        onClose();
        return;
      }

      if (tripPlacesRes.error) {
        console.error("Failed to fetch trip places:", tripPlacesRes.error);
        toast({
          variant: "destructive",
          title: "Could not check saved trips",
          description: "Please try again.",
        });
        setLoadingTrips(false);
        onClose();
        return;
      }

      const trips = (tripsRes.data ?? []) as Trip[];
      const tripPlaces = (tripPlacesRes.data ?? []) as TripPlaceRow[];

      const map: Record<string, boolean> = {};
      tripPlaces.forEach((item) => {
        map[item.trip_id] = true;
      });

      setTripPlaceMap(map);
      setUserTrips(trips);
      setHasNoTrips(trips.length === 0);
      setLoadingTrips(false);
    };

    fetchUserTrips();
  }, [isOpen, placeId, onClose, toast]);

  const handleClose = () => {
    setUserTrips([]);
    setSavingToTrip(false);
    setSelectedTripId(null);
    setTripPlaceMap({});
    setLoadingTrips(false);
    setHasNoTrips(false);
    onClose();
  };

  const handleSaveToTrip = async (tripId: string) => {
    if (!placeId) return;
    if (tripPlaceMap[tripId]) return;

    setSavingToTrip(true);
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
        toast({
          variant: "destructive",
          title: "Already added",
          description: "This place is already in that trip.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Could not save place",
          description: "Please try again.",
        });
      }

      setSavingToTrip(false);
      return;
    }

    setTripPlaceMap((prev) => ({
      ...prev,
      [tripId]: true,
    }));

    toast({
      title: "Place added",
      description: "The place was added to your trip successfully.",
    });

    setSavingToTrip(false);
    handleClose();
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

        {loadingTrips ? (
          <p className="text-sm text-muted-foreground">Loading trips...</p>
        ) : hasNoTrips ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You do not have any trips yet. Create one first.
            </p>
            <Link
              href="/trips"
              onClick={handleClose}
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
      </div>
    </div>
  );
}