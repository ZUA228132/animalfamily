import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import FooterNav from '../components/FooterNav';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import AnnouncementCard from '../components/AnnouncementCard';

interface Announcement {
  id: number | string;
  title: string;
  description: string;
  owner_username: string | null;
  image_url?: string | null;
  location?: any;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const Map = dynamic(() => import('../components/Map'), { ssr: false });

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, description, image_url, location, users(username)')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Error fetching announcements:', error.message);
        } else {
          // Flatten the nested user
          const flat = (data || []).map((ann: any) => ({
            id: ann.id,
            title: ann.title,
            description: ann.description,
            owner_username: ann.users?.username ?? null,
            image_url: ann.image_url ?? null,
            location: ann.location ?? null,
          }));
          setAnnouncements(flat);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAll();
  }, []);

  return (
    <main>
      <Header />
      <div className="container">
        <h2>Объявления</h2>

{typeof window !== 'undefined' && announcements.length > 0 && (
  <div className="card fade-in" style={{ marginBottom: '1.25rem' }}>
    <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Карта объявлений</h3>
    <div style={{ height: 240, borderRadius: 12, overflow: 'hidden' }}>
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
    </div>
  </div>
)}
        {announcements.length === 0 && <p>Объявления не найдены.</p>}
        {announcements.map((ann) => (
          <AnnouncementCard
            key={ann.id}
            title={ann.title}
            description={ann.description}
            ownerUsername={ann.owner_username}
            imageUrl={ann.image_url}
          />
        ))}
      </div>
      <FooterNav />
    </main>
  );
}