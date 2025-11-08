/**
 * Full‑screen preloader displayed while the app is initialising.  It shows
 * a spinning circle and a short loading message.  The styling for
 * the spinner lives in globals.css.
 */
export default function Preloader() {
  return (
    <div className="preloader-overlay">
      <div className="spinner"></div>
      <p>Загрузка…</p>
    </div>
  );
}