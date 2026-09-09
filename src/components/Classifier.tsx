"use client";

import { useCallback, useRef, useState } from "react";
import { SPECIES_INFO, SpeciesCode } from "@/lib/species";

type PredictResponse = {
  label: SpeciesCode;
  info: { common_name: string; scientific_name: string } | null;
  probabilities: Record<string, number>;
};

type Status = "idle" | "ready" | "loading" | "done" | "error";

export default function Classifier() {
  const [status, setStatus] = useState<Status>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectFile = useCallback((selected: File | undefined | null) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setErrorMessage("Please choose an image file.");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setResult(null);
    setErrorMessage(null);
    setStatus("ready");
  }, []);

  const handleClassify = async () => {
    if (!file) return;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? `Request failed (${res.status})`);
      }

      const data: PredictResponse = await res.json();
      setResult(data);
      setStatus("done");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while classifying this image.";
      setErrorMessage(
        message.includes("fetch")
          ? "Couldn't reach the classifier API. It may be waking up from sleep — wait a few seconds and try again."
          : message
      );
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMessage(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const sortedProbabilities = result
    ? Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="w-full max-w-xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          selectFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer
          ${isDragging ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-accent"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => selectFile(e.target.files?.[0])}
        />

        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a remote/optimizable image
          <img
            src={previewUrl}
            alt="Selected leaf"
            className="h-48 w-48 rounded-xl object-cover shadow-sm"
          />
        ) : (
          <>
            <span className="text-4xl">🍃</span>
            <p className="font-medium">Drop a leaf photo here, or click to choose one</p>
            <p className="text-sm text-muted">JPG or PNG, up to 10MB</p>
          </>
        )}
      </div>

      {file && status !== "loading" && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={handleClassify}
            className="rounded-full bg-accent px-6 py-2.5 font-medium text-white transition-colors hover:bg-accent-strong"
          >
            Identify this leaf
          </button>
          <button
            onClick={reset}
            className="rounded-full border border-border px-5 py-2.5 font-medium text-muted transition-colors hover:text-foreground hover:border-foreground"
          >
            Choose another
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="mt-6 flex flex-col items-center gap-2 text-muted animate-fade-up">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm">
            Removing background, extracting texture &amp; shape features…
          </p>
        </div>
      )}

      {status === "error" && errorMessage && (
        <p className="mt-4 text-center text-sm text-red-600 animate-fade-up">{errorMessage}</p>
      )}

      {status === "done" && result && (
        <div className="mt-8 animate-fade-up rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Predicted species
          </p>
          <h2 className="mt-1 text-2xl font-bold text-accent-strong">
            {SPECIES_INFO[result.label]?.local ?? result.label}
          </h2>
          <p className="text-muted">
            {result.info?.common_name ?? SPECIES_INFO[result.label]?.common} ·{" "}
            <span className="italic">
              {result.info?.scientific_name ?? SPECIES_INFO[result.label]?.scientific}
            </span>
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {sortedProbabilities.map(([code, prob]) => (
              <div key={code}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">
                    {SPECIES_INFO[code as SpeciesCode]?.local ?? code}
                  </span>
                  <span className="text-muted">{(prob * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-accent-soft">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
