import { useEffect, useState } from 'react';
import FooterNav from '../components/FooterNav';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';

interface PendingAnnouncement {
  id: number;
  title: string;
  description: string;
}

export default function AdminPage() {
  const [pending, setPending] = useState<PendingAnnouncement[]>([]);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerImage, setBannerImage] = useState<File | null>(null);

  useEffect(() => {
    // Load pending announcements for moderation
    async function fetchPending() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, description')
          .eq('status', 'pending')
          .order('created_at');
        if (error) {
          console.error('Error fetching pending announcements:', error.message);
        } else {
          setPending(data || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchPending();
  }, []);

  // Functions to approve or reject announcements
  const approve = async (id: number) => {
    await supabase.from('announcements').update({ status: 'published' }).eq('id', id);
    setPending((prev) => prev.filter((a) => a.id !== id));
  };

  const reject = async (id: number) => {
    await supabase.from('announcements').delete().eq('id', id);
    setPending((prev) => prev.filter((a) => a.id !== id));
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For demonstration: Save banner details. In a real app, upload the image to
    // Supabase Storage and store the URL in the database.
    console.log('Saving banner', { bannerTitle, bannerSubtitle, bannerLink, bannerImage });
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerLink('');
    setBannerImage(null);
    alert('Banner saved (simulation)');
  };

  return (
    <main>
      <Header />
      <div className="container">
        <h2>Admin Panel</h2>
        <section style={{ marginBottom: '2rem' }}>
          <h2>Pending announcements</h2>
          {pending.length === 0 && <p>No announcements require moderation.</p>}
          {pending.map((ann) => (
            <div key={ann.id} className="card">
              <h3>{ann.title}</h3>
              <p>{ann.description}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => approve(ann.id)}>Approve</button>
                <button onClick={() => reject(ann.id)} style={{ background: '#ffd1d1' }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </section>
        <section style={{ marginBottom: '2rem' }}>
          <h2>Upload Banner</h2>
          <form onSubmit={handleBannerSubmit} className="card" style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                Title
                <br />
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                Subtitle
                <br />
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                Link URL
                <br />
                <input
                  type="url"
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                Image
                <br />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerImage(e.target.files ? e.target.files[0] : null)}
                />
              </label>
            </div>
            <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Save Banner
            </button>
          </form>
        </section>
        <section style={{ marginBottom: '2rem' }}>
          <h2>Upload TGS Animation</h2>
          <p>Use this section to upload animated stickers in .tgs format. Please ensure the file meets Telegram's requirements (512×512 px, ≤ 3 sec, 60 fps).</p>
          <div className="card" style={{ padding: '1rem' }}>
            <input type="file" accept="application/x-tgsticker" />
            <button disabled style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Upload (placeholder)
            </button>
          </div>
        </section>
      </div>
      <FooterNav />
    </main>
  );
}