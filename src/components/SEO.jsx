import { useEffect } from 'react';

const ensureMeta = (name, attr, content) => {
  if (!content) return;
  let el = document.querySelector(`meta[${name}='${attr}']`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(name, attr);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const ensureLink = (rel, href) => {
  if (!href) return;
  let el = document.querySelector(`link[rel='${rel}']`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const injectJsonLd = (json) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(json);
  document.head.appendChild(script);
  return () => {
    try { document.head.removeChild(script); } catch (_) {}
  };
};

const SEO = ({ title, description, url, image, canonical, jsonLd = [] }) => {
  useEffect(() => {
    if (title) document.title = title;
    ensureMeta('name', 'description', description);
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', description);
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('property', 'og:url', url);
    ensureMeta('property', 'og:image', image);
    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', description);
    ensureMeta('name', 'twitter:image', image);
    ensureLink('canonical', canonical || url);

    const removers = (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
      .filter(Boolean)
      .map(injectJsonLd);
    return () => removers.forEach((r) => r && r());
  }, [title, description, url, image, canonical]);

  return null;
};

export default SEO;


