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
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    alert('Пожалуйста, укажите заголовок объявления.');
    return;
  }
  setSubmitting(true);
  try {
    let imageUrl: string | null = null;

    // Если выбрано фото — загружаем его в Supabase Storage (bucket "announcements")
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `announcements/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('announcements')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error(uploadError);
        alert('Не удалось загрузить фото: ' + uploadError.message);
      } else {
        const { data: publicData } = supabase.storage
          .from('announcements')
          .getPublicUrl(filePath);
        imageUrl = publicData?.publicUrl ?? null;
      }
    }

    const payload: any = {
      title,
      description,
      status: 'pending',
    };
    if (imageUrl) {
      payload.image_url = imageUrl;
    }
    // Include location if available.  Supabase accepts GeoJSON objects
    // for geography(Point) columns.
    if (lat !== null && lng !== null) {
      // Supabase PostGIS geography columns accept WKT strings, e.g. 'POINT(lon lat)'
      payload.location = `POINT(${lng} ${lat})`;
    }

    const { error } = await supabase.from('announcements').insert(payload);
    if (error) {
      console.error('Error inserting announcement:', error.message);
      alert('Не удалось сохранить объявление: ' + error.message);
    } else {
      alert('Объявление отправлено на модерацию!');
      setTitle('');
      setDescription('');
      setImageFile(null);
    }
  } catch (err: any) {
    console.error(err);
    alert('An unexpected error occurred.');
  } finally {
    setSubmitting(false);
  }
}  }

  return (
    <main>
      <Header />
      <div className="container">
        <h2>Создать объявление</h2>
        <form onSubmit={handleSubmit} className="card" style={{ padding: '1rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Заголовок
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
              Описание
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
  <label>
    Фото питомца (необязательно)
    <br />
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
      }}
    />
  </label>
</div>
          <div style={{ marginBottom: '0.5rem' }}>
            {lat !== null && lng !== null ? (
              <>
                <p>Ваше местоположение: {lat.toFixed(5)}, {lng.toFixed(5)}</p>
                {/* Show a small map with the user's location */}
                <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden' }}>
                  <Map
                    center={[lat, lng] as [number, number]}
                    markers={[{ position: [lat, lng] as [number, number], label: 'Вы' }]}
                  />
                </div>
              </>
            ) : (
              <p>Разрешите доступ к геолокации, чтобы добавить вашу позицию.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            {submitting ? 'Отправка…' : 'Отправить'}
          </button>
        </form>
      </div>
      <FooterNav />
    </main>
  );
}