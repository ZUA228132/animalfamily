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
  // Protect the admin page from public access.  By default the
  // admin panel is hidden unless the NEXT_PUBLIC_SHOW_ADMIN_NAV
  // environment variable is set to 'true'.  Adjust this logic to
  // integrate with your own auth system.
  if (process.env.NEXT_PUBLIC_SHOW_ADMIN_NAV !== 'true') {
    return (
      <main>
        <Header />
        <div className="container">
          <h2>Админ панель</h2>
          <p>У вас нет доступа к этой странице.</p>
        </div>
        <FooterNav />
      </main>
    );
  }
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
        <h2>Админ панель</h2>
        <section style={{ marginBottom: '2rem' }}>
          <h2>Объявления на модерации</h2>
          {pending.length === 0 && <p>Нет объявлений, требующих модерации.</p>}
          {pending.map((ann) => (
            <div key={ann.id} className="card">
              <h3>{ann.title}</h3>
              <p>{ann.description}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => approve(ann.id)}>Одобрить</button>
                <button onClick={() => reject(ann.id)} style={{ background: '#ffd1d1' }}>
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </section>
        <section style={{ marginBottom: '2rem' }}>
          <h2>Загрузка баннера</h2>
          <form onSubmit={handleBannerSubmit} className="card" style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                Заголовок
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
                Подзаголовок
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
                Ссылка
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
                Картинка
                <br />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerImage(e.target.files ? e.target.files[0] : null)}
                />
              </label>
            </div>
            <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Сохранить баннер
            </button>
          </form>
        </section>
        <section style={{ marginBottom: '2rem' }}>
          <h2>Загрузка TGS‑анимации</h2>
          <p>Используйте этот раздел для загрузки анимированных стикеров в формате .tgs. Убедитесь, что файл соответствует требованиям Telegram (512×512 px, ≤ 3 сек, 60 fps).</p>
          <div className="card" style={{ padding: '1rem' }}>
            <input type="file" accept="application/x-tgsticker" />
            <button disabled style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Загрузить (заглушка)
            </button>
          </div>
        </section>
      </div>
      <FooterNav />
    </main>
  );
}