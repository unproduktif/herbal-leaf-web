import Classifier from "@/components/Classifier";
import { SPECIES_INFO, SPECIES_ORDER } from "@/lib/species";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-16 sm:py-24">
        <header className="flex flex-col items-center text-center animate-fade-up">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            classical computer vision
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Herbal Leaf Identifier
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Upload a photo of a leaf and this classifier will tell you which of
            5 Indonesian herbal plant species it is — no deep learning, just
            background removal, GLCM texture &amp; shape descriptors, and a
            linear SVM trained from scratch.
          </p>
        </header>

        <div className="mt-10 w-full flex justify-center">
          <Classifier />
        </div>

        <section className="mt-16 w-full">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted">
            supported species
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {SPECIES_ORDER.map((code) => (
              <div
                key={code}
                className="rounded-xl border border-border bg-surface px-3 py-4 text-center"
              >
                <p className="font-semibold">{SPECIES_INFO[code].local}</p>
                <p className="text-xs text-muted">{SPECIES_INFO[code].common}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="w-full border-t border-border py-6 text-center text-xs text-muted">
        <p>
          Built by{" "}
          <a
            href="https://github.com/unproduktif"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-accent"
          >
            unproduktif
          </a>{" "}
          ·{" "}
          <a
            href="https://github.com/unproduktif/web-herbal-leaf-classification"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-2 hover:text-accent"
          >
            frontend
          </a>{" "}
          ·{" "}
          <a
            href="https://github.com/unproduktif/herbal-leaf-classification"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-2 hover:text-accent"
          >
            model &amp; research
          </a>
        </p>
      </footer>
    </div>
  );
}
