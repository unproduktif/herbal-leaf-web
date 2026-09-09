# Herbal Leaf Identifier

Next.js frontend for identifying Indonesian herbal leaf species from a photo —
Guava (Jambu), Turmeric (Kunyit), Fern (Paku), Cassava (Singkong), or Betel
(Sirih).

Upload a leaf photo and it's sent to a separate classical computer-vision API
(background removal, GLCM texture + shape descriptors, linear SVM — see
[herbal-leaf-api](https://github.com/unproduktif/herbal-leaf-api)) which
returns the predicted species with a confidence score per class.

## Getting Started

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your running API
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the classifier API (see `herbal-leaf-api`). Defaults to `http://localhost:8000` if unset. |

## Deployment

Deployed on [Vercel](https://vercel.com). Set `NEXT_PUBLIC_API_URL` to the
deployed API's URL (e.g. a Render service URL) in the Vercel project's
environment variables before deploying.

## Related repos

- [herbal-leaf-api](https://github.com/unproduktif/herbal-leaf-api) — the FastAPI inference service
- [herbal-leaf-classification](https://github.com/unproduktif/herbal-leaf-classification) — the original research notebook, dataset, and report
