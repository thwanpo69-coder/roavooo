import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Coffee, Bed, Activity as ActivityIcon } from 'lucide-react';
import { CITIES, PLACES } from '@/lib/data';
import { PlaceCard } from '@/components/ui/PlaceCard';
import NotFound from './not-found';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function City() {
  const { slug } = useParams();
  const city = CITIES.find(c => c.slug === slug);

  if (!city) return <NotFound />;

  const cityPlaces = PLACES.filter(p => p.cityId === city.id);
  const stays = cityPlaces.filter(p => p.category === 'stay');
  const activities = cityPlaces.filter(p => p.category === 'activity');
  const restaurants = cityPlaces.filter(p => p.category === 'restaurant');

  return (
    <div className="w-full bg-background pb-24">
      {/* City Hero */}
      <div className="relative h-[60vh] min-h-[400px]">
        <div className="absolute inset-0">
          <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 w-fit transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-4"
          >
            {city.name}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-white/90 max-w-2xl font-light"
          >
            {city.tagline}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border mb-16">
          <h2 className="text-2xl font-serif font-bold mb-4">About {city.name}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{city.description}</p>
        </div>

        <Tabs defaultValue="stays" className="w-full">
          <TabsList className="mb-8 bg-muted/50 p-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="stays" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <Bed className="w-4 h-4 mr-2" /> Stays
            </TabsTrigger>
            <TabsTrigger value="activities" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <ActivityIcon className="w-4 h-4 mr-2" /> Experiences
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <Coffee className="w-4 h-4 mr-2" /> Dining
            </TabsTrigger>
            <TabsTrigger value="tips" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <Info className="w-4 h-4 mr-2" /> Travel Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stays" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stays.map(place => <PlaceCard key={place.id} place={place} />)}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.map(place => <PlaceCard key={place.id} place={place} />)}
            </div>
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map(place => <PlaceCard key={place.id} place={place} />)}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2"><Info className="text-primary" /> Best Time to Visit</h3>
                <p className="text-muted-foreground">{city.tips.bestTime}</p>
              </div>
              <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2"><Info className="text-primary" /> What to Pack</h3>
                <p className="text-muted-foreground">{city.tips.packing}</p>
              </div>
              <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2"><Info className="text-primary" /> Etiquette</h3>
                <p className="text-muted-foreground">{city.tips.etiquette}</p>
              </div>
              <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2"><Info className="text-primary" /> Getting Around</h3>
                <p className="text-muted-foreground">{city.tips.transport}</p>
              </div>
              <div className="bg-muted/30 p-8 rounded-2xl border border-border md:col-span-2">
                <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2"><Info className="text-primary" /> Useful Phrases</h3>
                <p className="text-muted-foreground">{city.tips.phrases}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
