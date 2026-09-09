# Herbal Leaf Identifier

Upload a photo of a leaf and this app identifies which of 5 Indonesian
herbal plant species it is — Guava (Jambu), Turmeric (Kunyit), Fern (Paku),
Cassava (Singkong), or Betel (Sirih).

This is a single [Vercel Services](https://vercel.com/docs/services) project
combining two independently-built parts on one domain:

- **`/`** — the Next.js frontend (this repo's `src/`)
- **`/api/predict`** — a Python FastAPI [Vercel Function](api/) running the
  classifier: a fixed-threshold segmentation, GLCM texture + shape-descriptor
  feature extraction, and a linear SVM trained from scratch (no deep
  learning). See [`api/pipeline.py`](api/pipeline.py) for the exact steps.

For best results, photograph the leaf against a plain, light-colored
background — the classifier segments the leaf using a brightness threshold,
not learned background removal.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Note: `npm run dev`
only runs the Next.js frontend — the `/api/predict` Python function needs
[`vercel dev`](https://vercel.com/docs/cli/dev) (which builds and serves
both services together) to work locally. Without it, the UI's classify step
will fail against a local dev server, the same way this project's other
API-backed demos behave.

## Deployment

Deployed on [Vercel](https://vercel.com) — push to `main` and Vercel builds
both services from `vercel.json`. No environment variables are required.

## Related repos

- [herbal-leaf-api](https://github.com/unproduktif/herbal-leaf-api) — a standalone FastAPI + Docker version of the same API (background removal included), kept as a reference/alternate deployment path
- [herbal-leaf-classification](https://github.com/unproduktif/herbal-leaf-classification) — the original research notebook, dataset, and report
