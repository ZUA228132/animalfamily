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
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, description, image_url, users(username)')
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