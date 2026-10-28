import { useEffect } from 'react';

/**
 * Universal SEO & Document Metadata Hook
 * Updates title, meta description, and Open Graph tags per-route.
 */
export const useSEO = ({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://khamosh-alfaaz-client.vercel.app/android-chrome-512x512.png',
}) => {
  useEffect(() => {
    const fullTitle = title
      ? (title.includes('Khamosh Alfaaz') ? title : `${title} — Khamosh Alfaaz`)
      : 'Khamosh Alfaaz — A Quiet Diary';

    document.title = fullTitle;

    // Helper to safely upsert meta tag
    const setMeta = (nameOrProp, value, isProperty = false) => {
      if (!value) return;
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, nameOrProp);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    }

    setMeta('og:title', fullTitle, true);
    setMeta('twitter:title', fullTitle);
    setMeta('og:type', ogType, true);

    if (ogImage) {
      setMeta('og:image', ogImage, true);
      setMeta('twitter:image', ogImage);
    }

    if (canonicalUrl) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonicalUrl);
    }
  }, [title, description, canonicalUrl, ogType, ogImage]);
};

export default useSEO;

