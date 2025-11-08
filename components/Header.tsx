/**
 * Top header component with the title and optional subtitle.
 */
import useTelegram from '../hooks/useTelegram';

export default function Header() {
  // Use Telegram WebApp context to personalise the header and apply theme.
  const { user } = useTelegram();
  return (
    <header className="header">
      <h1>Animal Family</h1>
      {user?.first_name ? (
        <p>Привет, {user.first_name}!</p>
      ) : (
        <p>Сообщество любителей животных</p>
      )}
    </header>
  );
}