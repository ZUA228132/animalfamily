import { useEffect, useState } from 'react';
import FooterNav from '../components/FooterNav';
import Header from '../components/Header';
import Banner from '../components/Banner';
import { supabase } from '../lib/supabaseClient';
import useTelegram from '../hooks/useTelegram';

interface Announcement {
  id: number | string;
  title: string;
  description: string;
  location?: any;
}

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [profileCity, setProfileCity] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState('');
  const [citySaving, setCitySaving] = useState(false);

  const { user } = useTelegram();

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

// Load or create simple profile with city bound to Telegram user
useEffect(() => {
  if (!user?.id) return;
  (async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('city')
        .eq('telegram_id', user.id.toString())
        .maybeSingle();
      if (!error && data) {
        setProfileCity(data.city || null);
        setCityInput(data.city || '');
      }
    } catch (err) {
      console.error('Error loading user profile', err);
    }
  })();
}, [user?.id]);

async function handleSaveCity(e: React.FormEvent) {
  e.preventDefault();
  if (!user?.id) {
    alert('Мы не смогли получить ваш Telegram аккаунт. Откройте мини‑приложение внутри Telegram.');
    return;
  }
  const trimmed = cityInput.trim();
  if (!trimmed) {
    alert('Пожалуйста, укажите ваш город.');
    return;
  }
  setCitySaving(true);
  try {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || null;
    const payload: any = {
      telegram_id: user.id.toString(),
      city: trimmed,
      full_name: fullName,
      username: user.username ?? null,
      avatar_url: user.photo_url ?? null,
    };
    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'telegram_id' });
    if (error) {
      console.error('Error saving city', error.message);
      alert('Не удалось сохранить город: ' + error.message);
    } else {
      setProfileCity(trimmed);
    }
  } catch (err) {
    console.error(err);
    alert('Произошла ошибка при сохранении города.');
  } finally {
    setCitySaving(false);
  }
}


  return (
    <main>
      <Header />
      <div className="container">
        {user?.first_name && (
          <p className="greeting">Привет, {user.first_name}! 🐾</p>
        )}

{user?.id && !profileCity && (
  <div className="card city-card fade-in">
    <h3>Город, где вы ищете питомцев</h3>
    <p>Укажите свой город — мы закрепим его за вашим профилем. Это поможет лучше настраивать объявления.</p>
    <form onSubmit={handleSaveCity}>
      <input
        type="text"
        placeholder="Например, Ростов-на-Дону"
        value={cityInput}
        onChange={(e) => setCityInput(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #dde0e7', marginBottom: '0.5rem' }}
      />
      <button
        type="submit"
        disabled={citySaving}
        className="primary-button"
      >
        {citySaving ? 'Сохраняем…' : 'Сохранить город'}
      </button>
    </form>
  </div>
)}
{user?.id && profileCity && (
  <p className="profile-city">Ваш город: <strong>{profileCity}</strong></p>
)}

        {/* Banner placeholder. In production you would fetch banner data from Supabase. */}
        <Banner
          title="Помогите найти дом"
          subtitle="Публикуйте объявления о потерянных питомцах и возможностях усыновления"
          imageUrl={undefined}
          link={undefined}
        />
        {/* Example prompt encouraging the user to create an announcement */}
        <div className="card premium-info fade-in">
          <h3>{user?.first_name ? `${user.first_name}, создайте своё объявление!` : 'Создайте своё объявление!'}</h3>
          <p>Добавьте информацию о потерянном или найденном питомце и помогите ему найти дом.</p>
          <a href="/create" className="cta-button">Создать объявление</a>
        </div>
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