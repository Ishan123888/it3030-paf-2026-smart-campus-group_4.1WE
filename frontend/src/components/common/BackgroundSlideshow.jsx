import React, { useCallback, useEffect, useMemo, useState } from 'react';

export function toImgurDirect(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  const match = trimmed.match(/imgur\.com\/([a-zA-Z0-9]+)(\.[a-zA-Z0-9]+)?/);
  if (!match) return trimmed;
  const id = match[1];
  const ext = match[2] || '.jpg';
  return `https://i.imgur.com/${id}${ext}`;
}

export const DEFAULT_SLIDES = [
  toImgurDirect('https://imgur.com/xDZVwip'),
  toImgurDirect('https://imgur.com/HYrM29J'),
  toImgurDirect('https://imgur.com/HYrM29J'),
].filter(Boolean);

function SafeCoverImage({ src, alt, className }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return <div className={['bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-transparent', className].join(' ')} />;
  }
  return <img src={src} alt={alt} className={className} onError={() => setOk(false)} />;
}

export default function BackgroundSlideshow({
  slides = DEFAULT_SLIDES,
  intervalMs = 5200,
  overlay = true,
  overlayClassName,
  className,
  children,
}) {
  const list = useMemo(() => (Array.isArray(slides) ? slides.filter(Boolean) : []), [slides]);

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [busy, setBusy] = useState(false);

  const goTo = useCallback(
    (idx) => {
      if (busy) return;
      const n = list.length;
      if (!n) return;
      const target = ((idx % n) + n) % n;
      if (target === current) return;
      setBusy(true);
      setPrev(current);
      setCurrent(target);
      window.setTimeout(() => {
        setPrev(null);
        setBusy(false);
      }, 850);
    },
    [busy, current, list.length],
  );

  const next = useCallback(() => goTo(current + 1), [goTo, current]);

  useEffect(() => {
    if (list.length <= 1) return undefined;
    const id = window.setInterval(() => next(), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, list.length, next]);

  const slideClass = (i) => {
    if (i === current) return 'hero-slide active';
    if (i === prev) return 'hero-slide exit';
    return 'hero-slide enter';
  };

  return (
    <div className={['relative overflow-hidden', className].filter(Boolean).join(' ')}>
      <div className="absolute inset-0">
        {list.map((src, i) => (
          <div key={`${src}-${i}`} className={slideClass(i)}>
            <SafeCoverImage src={src} alt={`Background ${i + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
        {overlay ? (
          <>
            <div className={overlayClassName || 'absolute inset-0 bg-black/55'} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[var(--bg)]" />
          </>
        ) : null}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

