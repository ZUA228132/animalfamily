# Animal Family

This repository contains a prototype Telegram Mini‑App for **Animal Family**. It implements a basic multi‑page layout with three sections—Home, Announcements and Admin—accessible via a fixed footer navigation bar. The app is intended to be deployed on [Vercel](https://vercel.com) and uses [Supabase](https://supabase.com) as the backend database.

## Features

* **Home page** — shows a map placeholder and the latest announcements from Supabase.
* **Announcements page** — lists all published announcements and provides a deep link to message the owner via Telegram.
* **Admin panel** — allows administrators to moderate pending announcements, upload banners and TGS animations (placeholder form).
* **Footer navigation** — a fixed bar at the bottom of the screen provides navigation between the three sections.

## Configuration

To run this project locally you need to install dependencies and configure environment variables:

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file at the root of the project and set the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

These values can be obtained from your Supabase project settings.

3. Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`. When deploying to Vercel, configure the same environment variables in the Vercel dashboard.

## Notes

* This is a simplified prototype. Real application logic such as authentication, authorization, error handling, file uploads and advanced map functionality still need to be implemented.
* The map on the home page is a placeholder. To integrate a real map, consider using [Leaflet.js](https://leafletjs.com/) or another mapping library and the Telegram `LocationManager` API.
* The Admin panel includes a placeholder for uploading TGS files. You must validate the file according to Telegram's TGS specifications (512×512 px, ≤ 3 sec, 60 fps) before saving it.
* Deep links to Telegram follow the format `https://t.me/<username>?text=Hello`.

## License

This code is provided as‑is for educational purposes.