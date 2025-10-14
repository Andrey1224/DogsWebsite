export default function Head() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/hero/hero-1600.avif"
        type="image/avif"
        imageSrcSet="/hero/hero-800.avif 800w, /hero/hero-1200.avif 1200w, /hero/hero-1600.avif 1600w"
        imageSizes="100vw"
      />
      <link
        rel="preload"
        as="image"
        href="/hero/hero-1600.webp"
        type="image/webp"
        imageSrcSet="/hero/hero-800.webp 800w, /hero/hero-1200.webp 1200w, /hero/hero-1600.webp 1600w"
        imageSizes="100vw"
      />
    </>
  );
}
