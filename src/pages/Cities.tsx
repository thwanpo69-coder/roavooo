import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

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

export function Cities() {
  const { lang } = useLanguage();
  const [cities, setCities] = useState<DbCity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Failed to fetch cities:", error);
        setCities([]);
      } else {
        setCities((data as DbCity[]) || []);
      }

      setLoading(false);
    };

    fetchCities();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-3">
          Destinations
        </p>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
          Explore Cities
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Discover Morocco’s most exciting destinations, from iconic historic
          cities to vibrant modern escapes.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="aspect-[3/4] rounded-2xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">No cities found</h2>
          <p className="text-muted-foreground">
            Cities will appear here once they are added.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city, index) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
            >
              <Link
                href={`/city/${city.slug}`}
                className="group relative block aspect-[3/4] rounded-2xl overflow-hidden"
              >
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />

                <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/45 backdrop-blur-md px-3 py-1.5 text-white text-xs border border-white/15">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Morocco</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
                    {city.name}
                  </h2>

                  <p className="text-white/75 text-sm line-clamp-2 mb-4">
                    {lang === "fr" ? city.tagline_fr : city.tagline_en}
                  </p>

                  <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold">
                    Explore city <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}