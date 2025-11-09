import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import useTelegram from '../hooks/useTelegram';
import { supabase } from '../lib/supabaseClient';

interface PetPassport {
  id?: string;
  telegram_id?: string;
  pet_name: string;
  date_of_birth: string | null;
  avatar_url?: string | null;
  allergies?: string | null;
  vaccinations?: string | null;
  habits?: string | null;
  additional_info?: string | null;
}

export default function CabinetPage() {
  const { user } = useTelegram();
  const [pet, setPet] = useState<PetPassport>({
    pet_name: '',
    date_of_birth: null,
    allergies: '',
    vaccinations: '',
    habits: '',
    additional_info: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const telegramId = user?.id ? user.id.toString() : null;

  // Вычисляем возраст на основе даты рождения
  const ageText = useMemo(() => {
    if (!pet.date_of_birth) return '';
    const dob = new Date(pet.date_of_birth);
    if (Number.isNaN(dob.getTime())) return '';
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} г.`);
    if (months > 0) parts.push(`${months} мес.`);
    return parts.join(' ');
  }, [pet.date_of_birth]);

  // Загрузка существующего паспорта для текущего пользователя
  useEffect(() => {
    if (!telegramId) return;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pet_passports')
          .select('*')
          .eq('telegram_id', telegramId)
          .limit(1)
          .maybeSingle();
        if (error) {
          console.error('Error loading pet passport', error.message);
        } else if (data) {
          setPet({
            id: data.id,
            telegram_id: data.telegram_id,
            pet_name: data.pet_name,
            date_of_birth: data.date_of_birth,
            avatar_url: data.avatar_url,
            allergies: data.allergies,
            vaccinations: data.vaccinations,
            habits: data.habits,
            additional_info: data.additional_info,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [telegramId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!pet.pet_name) {
      alert('Укажите имя питомца.');
      return;
    }
    if (!telegramId) {
      alert('Мы не смогли получить ваш Telegram ID. Откройте мини‑приложение внутри Telegram.');
      return;
    }
    setSaving(true);
    try {
      let avatarUrl: string | null = pet.avatar_url ?? null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `${telegramId}-${Date.now()}.${ext}`;
        const filePath = `pets/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('announcements')
          .upload(filePath, imageFile, { upsert: true });
        if (uploadError) {
          console.error(uploadError);
          alert('Не удалось загрузить фото питомца: ' + uploadError.message);
        } else {
          const { data: publicData } = supabase.storage
            .from('announcements')
            .getPublicUrl(filePath);
          avatarUrl = publicData?.publicUrl ?? null;
        }
      }

      const payload: any = {
        telegram_id: telegramId,
        pet_name: pet.pet_name,
        date_of_birth: pet.date_of_birth,
        allergies: pet.allergies,
        vaccinations: pet.vaccinations,
        habits: pet.habits,
        additional_info: pet.additional_info,
        avatar_url: avatarUrl,
      };

      let error;
      if (pet.id) {
        const res = await supabase
          .from('pet_passports')
          .update(payload)
          .eq('id', pet.id);
        error = res.error;
      } else {
        const res = await supabase
          .from('pet_passports')
          .insert(payload)
          .select()
          .single();
        error = res.error;
        if (!error && res.data) {
          setPet((prev) => ({ ...prev, id: res.data.id }));
        }
      }

      if (error) {
        console.error('Error saving pet passport', error.message);
        alert('Не удалось сохранить паспорт: ' + error.message);
      } else {
        alert('Паспорт питомца сохранён!');
      }
    } catch (err: any) {
      console.error(err);
      alert('Произошла ошибка при сохранении.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <Header />
      <div className="container">
        <h2>Личный кабинет</h2>
        <p>Создайте цифровой паспорт питомца. Данные всегда под рукой.</p>
        {!user && (
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Мы не видим ваши данные Telegram. Убедитесь, что открываете мини‑приложение из Telegram.
          </p>
        )}
        <form onSubmit={handleSave} className="card" style={{ padding: '1rem' }}>
          <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
              }}
            >
              {pet.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pet.avatar_url}
                  alt={pet.pet_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span>🐶</span>
              )}
            </div>
            <div>
              <label>
                Фото питомца
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
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Имя питомца
              <br />
              <input
                type="text"
                value={pet.pet_name}
                onChange={(e) => setPet({ ...pet, pet_name: e.target.value })}
                required
                style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Дата рождения
              <br />
              <input
                type="date"
                value={pet.date_of_birth ?? ''}
                onChange={(e) => setPet({ ...pet, date_of_birth: e.target.value || null })}
                style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>
            {ageText && <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>Возраст: {ageText}</p>}
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Аллергии
              <br />
              <textarea
                value={pet.allergies ?? ''}
                onChange={(e) => setPet({ ...pet, allergies: e.target.value })}
                rows={2}
                style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Прививки
              <br />
              <textarea
                value={pet.vaccinations ?? ''}
                onChange={(e) => setPet({ ...pet, vaccinations: e.target.value })}
                rows={2}
                style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Привычки
              <br />
              <textarea
                value={pet.habits ?? ''}
                onChange={(e) => setPet({ ...pet, habits: e.target.value })}
                rows={2}
                style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label>
              Дополнительная информация
              <br />
              <textarea
                value={pet.additional_info ?? ''}
                onChange={(e) => setPet({ ...pet, additional_info: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              width: '100%',
            }}
          >
            {saving ? 'Сохранение…' : 'Сохранить паспорт'}
          </button>
        </form>
      </div>
      <FooterNav />
    </main>
  );
}
