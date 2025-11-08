import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import dynamic from 'next/dynamic';

/**
 * Page for creating a new announcement.  Users can enter a title and
 * description and, if they grant location permission, their current
 * location will be used for the announcement.  Submissions are saved
 * with a status of 'pending' until an admin approves them.
 */
export default function CreateAnnouncementPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const Map = dynamic(() => import('../components/Map'), { ssr: false });

  useEffect(() => {
    // Request the user's current position on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
        }
      );
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) {
      alert('Please provide a title for your announcement.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        title,
        description,
        status: 'pending',
      };
      // Include location if available.  Supabase accepts GeoJSON objects
      // for geography(Point) columns.
      if (lat !== null && lng !== null) {
        payload.location = { type: 'Point', coordinates: [lng, lat] };
      }
      const { error } = await supabase.from('announcements').insert(payload);
      if (error) {
        alert('Failed to save announcement: ' + error.message);
      } else {
        alert('Announcement submitted for moderation. Thank you!');
        setTitle('');
        setDescription('');
      }
    } catch (err: any) {
      console.error(err);
      alert('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <Header />
      <div className="container">
        <h2>Create Announcement</h2>
        <form onSubmit={handleSubmit} className="card" style={{ padding: '1rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Title
              <br />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Description
              <br />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            {lat !== null && lng !== null ? (
              <>
                <p>Your location: {lat.toFixed(5)}, {lng.toFixed(5)}</p>
                {/* Show a small map with the user's location */}
                <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden' }}>
                  <Map
                    center={[lat, lng] as [number, number]}
                    markers={[{ position: [lat, lng] as [number, number], label: 'You' }]}
                  />
                </div>
              </>
            ) : (
              <p>Enable location services to include your position.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </div>
      <FooterNav />
    </main>
  );
}