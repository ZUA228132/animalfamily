import { useEffect, useState } from 'react';
import FooterNav from '../components/FooterNav';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

interface Announcement {
  id: number;
  title: string;
  description: string;
  owner_username: string | null;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, description, users(username)')
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
        <h2>Announcements</h2>
        {announcements.length === 0 && <p>No announcements found.</p>}
        {announcements.map((ann) => (
          <div key={ann.id} className="card">
            <h3>{ann.title}</h3>
            <p>{ann.description}</p>
            {ann.owner_username && (
              <a
                href={`https://t.me/${ann.owner_username}?text=Hello, I am interested in your announcement!`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Message owner
              </a>
            )}
          </div>
        ))}
      </div>
      <FooterNav />
    </main>
  );
}