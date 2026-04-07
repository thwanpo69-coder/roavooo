import { useParams, Link } from 'wouter';
import { MapPin, Star, Heart, ArrowLeft, Share2 } from 'lucide-react';
import { PLACES, CITIES } from '@/lib/data';
import { useFavorites } from '@/hooks/use-favorites';
import { Button } from '@/components/ui/button';
import NotFound from './not-found';
import { PlaceCard } from '@/components/ui/PlaceCard';

export function Place() {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const place = PLACES.find(p => p.id === id);
  
  if (!place) return <NotFound />;

  const city = CITIES.find(c => c.id === place.cityId);
  const isFav = isFavorite(place.id);
  
  const relatedPlaces = PLACES
    .filter(p => p.cityId === place.cityId && p.category === place.category && p.id !== place.id)
    .slice(0, 3);

  return (
    <div className="w-full bg-background pb-24">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <Link href={`/city/${city?.slug}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to {city?.name}
        </Link>
        <div className="flex gap-4">
          <Button variant="outline" size="icon" className="rounded-full">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full border-border"
            onClick={() => toggleFavorite(place.id)}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-primary text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Col: Image & Details */}
        <div className="lg:col-span-8 space-y-8">
          <div className="aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-lg relative group">
            <img 
              src={place.imageUrl} 
              alt={place.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-4 py-2 bg-background/90 backdrop-blur-md text-xs font-semibold rounded-full uppercase tracking-wider text-primary shadow-sm">
                {place.category}
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">{place.name}</h1>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-lg font-bold bg-muted px-3 py-1.5 rounded-lg">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span>{place.rating}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground text-lg mb-8">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{place.location}, {city?.name}</span>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p className="text-xl text-foreground font-medium mb-6 leading-relaxed">
                {place.description}
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Booking/Info Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-card border border-border rounded-3xl p-8 shadow-xl">
            <div className="mb-6 pb-6 border-b border-border">
              {place.pricePerNight && (
                <div>
                  <span className="text-3xl font-bold text-foreground">${place.pricePerNight}</span>
                  <span className="text-muted-foreground ml-2">/ night</span>
                </div>
              )}
              {place.priceRange && (
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-muted-foreground">Price Range</span>
                  <span className="text-2xl font-bold text-primary">{place.priceRange}</span>
                </div>
              )}
              {place.cuisine && (
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-medium text-muted-foreground">Cuisine</span>
                  <span className="font-semibold">{place.cuisine}</span>
                </div>
              )}
            </div>

            <Button className="w-full py-6 text-lg rounded-xl mb-4 font-semibold shadow-md hover:shadow-lg transition-all">
              {place.category === 'stay' ? 'Check Availability' : 'Book Experience'}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              You won't be charged yet
            </p>

            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="font-serif font-bold text-lg mb-4">Highlights</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Authentic Moroccan Experience</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Premium Service</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Central Location</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Related Places */}
      {relatedPlaces.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-24">
          <h2 className="text-3xl font-serif font-bold mb-8">More {place.category}s in {city?.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPlaces.map(p => <PlaceCard key={p.id} place={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
