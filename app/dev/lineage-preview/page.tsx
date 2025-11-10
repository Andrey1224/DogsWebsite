import { notFound } from "next/navigation";

import { ParentPhotoCarousel } from "@/components/parent-photo-carousel";

const sirePhotos = ["/about/family-bulldogs.webp", "/about/puppy-play.webp", "/about/nursery.webp"];
const damPhotos = ["/about/puppy-play.webp", "/about/nursery.webp"];

export default function LineagePreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-bg px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold text-text">Lineage preview</h1>
        <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
          <p className="text-sm font-semibold text-muted">Lineage</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <span className="font-semibold text-text">Sire:</span> Monya
            </li>
            <li>
              <span className="font-semibold text-text">Dam:</span> Motya
            </li>
            <li>
              <span className="font-semibold text-text">Litter:</span> Private
            </li>
          </ul>
          <div className="grid gap-4 md:grid-cols-2">
            <ParentPhotoCarousel title="Sire" parentName="Monya" photos={sirePhotos} />
            <ParentPhotoCarousel title="Dam" parentName="Motya" photos={damPhotos} />
          </div>
        </div>
      </div>
    </main>
  );
}
