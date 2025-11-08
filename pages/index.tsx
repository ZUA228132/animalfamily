import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import FooterNav from '../components/FooterNav';
import Header from '../components/Header';
import Banner from '../components/Banner';
import { supabase } from '../lib/supabaseClient';

interface Announcement {
  id: number | string;
  title: string;
  description: string;
  location?: any;
}

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Load dynamic map component client‑side only
  const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
  });

  // Fetch the latest published announcements from Supabase on mount. If no
  // Supabase credentials are provided, this call will fail silently.
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, description, location')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(5);
        if (error) {
          console.error('Error fetching announcements:', error.message);
        } else {
          setAnnouncements(data || []);
        }
      } catch (err) {
        // network or other error
        console.error(err);
      }
    }
    fetchAnnouncements();
  }, []);

  return (
    <main>
      <Header />
      <div className="container">
        {/* Banner placeholder. In production you would fetch banner data from Supabase. */}
        <Banner
          title="Помогите найти дом"
          subtitle="Публикуйте объявления о потерянных питомцах и возможностях усыновления"
          imageUrl={undefined}
          link={undefined}
        />
        {/* Map component */}
        {typeof window !== 'undefined' ? (
          <Map
            markers={announcements
              .filter((ann) => ann.location && ann.location.coordinates)
              .map((ann) => ({
                position: [
                  ann.location.coordinates[1],
                  ann.location.coordinates[0],
                ] as [number, number],
                label: ann.title,
              }))}
          />
        ) : (
          <div className="map-placeholder">Loading map…</div>
        )}
        <h2 style={{ marginTop: '1rem' }}>Последние объявления</h2>
        {announcements.length === 0 && (
          <p>Пока объявлений нет. Будьте первым!</p>
        )}
        {announcements.map((ann) => (
          <div key={ann.id} className="card fade-in">
            <h3>{ann.title}</h3>
            <p>{ann.description}</p>
          </div>
        ))}
      </div>
      <FooterNav />
    </main>
  );
}