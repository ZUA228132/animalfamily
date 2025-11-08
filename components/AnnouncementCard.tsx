import Image from 'next/image';

interface AnnouncementCardProps {
  title: string;
  description: string;
  ownerUsername: string | null;
  imageUrl?: string | null;
}

/**
 * Card component for displaying individual announcements in a feed.  It
 * shows a thumbnail image (or a placeholder), a title and short
 * description, and a button to message the owner via Telegram.
 */
export default function AnnouncementCard({ title, description, ownerUsername, imageUrl }: AnnouncementCardProps) {
  return (
    <div className="announcement-card fade-in">
      <div className="announcement-image">
        <Image
          src={imageUrl || '/pet-placeholder.png'}
          alt={title}
          width={80}
          height={80}
        />
      </div>
      <div className="announcement-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {ownerUsername && (
          <a
            href={`https://t.me/${ownerUsername}?text=Привет, меня заинтересовало ваше объявление!`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Написать владельцу
          </a>
        )}
      </div>
    </div>
  );
}