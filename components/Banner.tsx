import Image from 'next/image';

interface BannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  link?: string;
}

/**
 * Banner component for the home page. Displays a pastel card with optional
 * background image, title and subtitle. Clicking the banner navigates to a
 * provided link if present.
 */
export default function Banner({ title, subtitle, imageUrl, link }: BannerProps) {
  const content = (
    <div
      className="card"
      style={{
        background: `linear-gradient(120deg, var(--color-secondary), var(--color-accent))`,
        color: '#444',
      }}
    >
      {imageUrl && (
        <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
          <Image src={imageUrl} alt={title} fill style={{ objectFit: 'cover' }} />
        </div>
      )}
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        {content}
      </a>
    );
  }
  return content;
}