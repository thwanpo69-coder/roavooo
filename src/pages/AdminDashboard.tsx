import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

type DbPlace = {
  id: string;
  city_id: string;
  name: string;
  category: "stay" | "activity" | "restaurant";
  description_en: string;
  description_fr: string;
  image_url: string;
  location: string | null;
  rating: number;
  price_per_night: number | null;
  price_range: string | null;
  cuisine: string | null;
};

type DbCity = {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  tagline_en: string;
  tagline_fr: string;
  description_en: string;
  description_fr: string;
  tip_best_time_en: string;
  tip_best_time_fr: string;
  tip_packing_en: string;
  tip_packing_fr: string;
  tip_etiquette_en: string;
  tip_etiquette_fr: string;
  tip_transport_en: string;
  tip_transport_fr: string;
  tip_phrases_en: string;
  tip_phrases_fr: string;
};

export function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"places" | "cities">("places");
  const [places, setPlaces] = useState<DbPlace[]>([]);
  const [cities, setCities] = useState<DbCity[]>([]);

  const loadPlaces = async () => {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setPlaces((data as DbPlace[]) || []);
  };

  const loadCities = async () => {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setCities((data as DbCity[]) || []);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLocation("/admin/login");
        return;
      }

      await Promise.all([loadPlaces(), loadCities()]);
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleDeletePlace = async (id: string) => {
    const ok = window.confirm("Delete this place?");
    if (!ok) return;

    const { error } = await supabase.from("places").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPlaces();
  };

  const handleDeleteCity = async (id: string) => {
    const ok = window.confirm("Delete this city?");
    if (!ok) return;

    const { error } = await supabase.from("cities").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadCities();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/admin/login");
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your Roavooo cities and places.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("places")}
              className={`px-4 py-2 rounded-lg font-semibold border ${
                activeTab === "places"
                  ? "bg-primary text-white border-primary"
                  : "border-border"
              }`}
            >
              Places
            </button>

            <button
              onClick={() => setActiveTab("cities")}
              className={`px-4 py-2 rounded-lg font-semibold border ${
                activeTab === "cities"
                  ? "bg-primary text-white border-primary"
                  : "border-border"
              }`}
            >
              Cities
            </button>

            {activeTab === "places" ? (
              <button
                onClick={() => setLocation("/admin/places/new")}
                className="bg-primary text-white px-4 py-2 rounded-lg font-semibold"
              >
                New Place
              </button>
            ) : (
              <button
                onClick={() => setLocation("/admin/cities/new")}
                className="bg-primary text-white px-4 py-2 rounded-lg font-semibold"
              >
                New City
              </button>
            )}

            <button
              onClick={handleLogout}
              className="border border-border px-4 py-2 rounded-lg font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {activeTab === "places" ? (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-border font-semibold text-sm">
              <div>Name</div>
              <div>City ID</div>
              <div>Category</div>
              <div>Rating</div>
              <div>Location</div>
              <div>Actions</div>
            </div>

            {places.map((place) => (
              <div
                key={place.id}
                className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-border text-sm items-center"
              >
                <div>{place.name}</div>
                <div>{place.city_id}</div>
                <div className="capitalize">{place.category}</div>
                <div>{place.rating}</div>
                <div>{place.location || "-"}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLocation(`/admin/places/${place.id}/edit`)}
                    className="px-3 py-1 rounded-md border border-border"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlace(place.id)}
                    className="px-3 py-1 rounded-md border border-red-300 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {places.length === 0 && (
              <div className="px-6 py-10 text-muted-foreground text-sm">
                No places yet.
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-border font-semibold text-sm">
              <div>Name</div>
              <div>ID</div>
              <div>Slug</div>
              <div>Hero Image</div>
              <div>Actions</div>
            </div>

            {cities.map((city) => (
              <div
                key={city.id}
                className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-border text-sm items-center"
              >
                <div>{city.name}</div>
                <div>{city.id}</div>
                <div>{city.slug}</div>
                <div className="truncate">{city.image_url}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLocation(`/admin/cities/${city.id}/edit`)}
                    className="px-3 py-1 rounded-md border border-border"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCity(city.id)}
                    className="px-3 py-1 rounded-md border border-red-300 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {cities.length === 0 && (
              <div className="px-6 py-10 text-muted-foreground text-sm">
                No cities yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}