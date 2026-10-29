import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Tag,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Compass,
  Check,
  Award
} from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { getBlogPostBySlug, getRelatedBlogPosts } from '../data/blogs';
import { siteConfig } from '../data/site';
import { useLanguage } from '../context/LanguageContext';
import { fetchPublicBlogBySlug } from '../services/api';
import { urlForImage } from '../sanity/client';
import './BlogDetail.css';

/**
 * Slugify utility for heading anchor IDs
 */
function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Custom Portable Text rendering components matching Vienna Day Trip luxury magazine aesthetics
 */
const createPortableTextComponents = (headingCounterRef) => ({
  types: {
    image: ({ value }) => {
      const imgUrl = urlForImage(value);
      if (!imgUrl) return null;
      return (
        <figure style={{ margin: '2.5rem 0', textAlign: 'center' }}>
          <img
            src={imgUrl}
            alt={value.alt || ''}
            title={value.title || undefined}
            loading="lazy"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '14px',
              border: '1px solid #E6D8C3',
              boxShadow: '0 8px 24px rgba(23, 25, 28, 0.06)',
              display: 'block',
              margin: '0 auto',
            }}
          />
          {value.caption && (
            <figcaption
              style={{
                fontFamily: 'Lora, Georgia, serif',
                fontSize: '0.88rem',
                color: '#62666D',
                fontStyle: 'italic',
                marginTop: '0.75rem',
                padding: '0 1rem',
              }}
            >
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    table: ({ value }) => {
      const rows = value?.rows || [];
      if (!rows || rows.length === 0) return null;
      const [headerRow, ...bodyRows] = rows;
      return (
        <div className="vdt-article-table-wrapper">
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontFamily: 'Lora, Georgia, serif',
              fontSize: '0.96rem',
            }}
          >
            {headerRow?.cells?.length > 0 && (
              <thead>
                <tr style={{ backgroundColor: '#FAF8F4', borderBottom: '2px solid #E6D8C3' }}>
                  {headerRow.cells.map((cell, idx) => (
                    <th
                      key={idx}
                      style={{
                        padding: '0.95rem 1.25rem',
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontWeight: 700,
                        color: '#17191C',
                        fontSize: '1rem',
                        borderRight: idx < headerRow.cells.length - 1 ? '1px solid #E6D8C3' : 'none',
                      }}
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr
                  key={row._key || rIdx}
                  style={{
                    borderBottom: rIdx < bodyRows.length - 1 ? '1px solid #E6D8C3' : 'none',
                    backgroundColor: rIdx % 2 === 1 ? '#FDFAF5' : '#FFFFFF',
                  }}
                >
                  {row.cells?.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: '0.9rem 1.25rem',
                        color: '#2B2F36',
                        borderRight: cIdx < row.cells.length - 1 ? '1px solid #E6D8C3' : 'none',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
  },
  block: {
    h2: ({ children, value }) => {
      const text = value?.children?.map((c) => c.text).join('') || '';
      const id = text ? `heading-h2-${slugify(text)}` : undefined;
      return <h2 id={id}>{children}</h2>;
    },
    h3: ({ children, value }) => {
      const text = value?.children?.map((c) => c.text).join('') || '';
      const id = text ? `heading-h3-${slugify(text)}` : undefined;
      return <h3 id={id}>{children}</h3>;
    },
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href = value?.href || '#';
      const isExternal = href.startsWith('http');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      );
    },
    internalLink: ({ value, children }) => {
      const slug = value?.reference?.slug?.current || value?.slug;
      const to = slug ? `/blog/${slug}/` : '#';
      return <Link to={to}>{children}</Link>;
    },
  },
});

/**
 * Safely parse and inject custom approved scripts (JSON-LD or validated domains)
 */
function injectApprovedScript(scriptContent, elementId) {
  if (!scriptContent || typeof scriptContent !== 'string') return null;
  const trimmed = scriptContent.trim();
  if (!trimmed) return null;

  const jsonLdMatch = trimmed.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      JSON.parse(jsonLdMatch[1]);
      const script = document.createElement('script');
      script.id = elementId;
      script.type = 'application/ld+json';
      script.text = jsonLdMatch[1];
      document.head.appendChild(script);
      return script;
    } catch {
      console.warn(`[Security] Custom script rejected: Invalid JSON-LD`);
      return null;
    }
  }

  const srcMatch = trimmed.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (srcMatch) {
    const src = srcMatch[1];
    const isApprovedHost = /^(https:\/\/www\.googletagmanager\.com|https:\/\/www\.google-analytics\.com)/i.test(src);
    if (isApprovedHost) {
      const script = document.createElement('script');
      script.id = elementId;
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
      return script;
    }
  }

  return null;
}

export default function BlogDetail() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const cleanSlug = useMemo(() => (slug || '').trim().replace(/\/+$/, ''), [slug]);
  const initialLocal = useMemo(() => getBlogPostBySlug(cleanSlug), [cleanSlug]);

  const [post, setPost] = useState(initialLocal || null);
  const [isLoading, setIsLoading] = useState(!initialLocal);
  const [liveRelated, setLiveRelated] = useState([]);
  const [activeTocId, setActiveTocId] = useState('');
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch article data (backend API -> Sanity -> local static fallback)
  useEffect(() => {
    const local = getBlogPostBySlug(cleanSlug);
    if (local) {
      setPost(local);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    let isMounted = true;
    fetchPublicBlogBySlug(cleanSlug).then((res) => {
      if (isMounted) {
        if (res?.blog) {
          setPost((prev) => ({
            ...(prev || {}),
            ...res.blog,
            primaryCategory: res.blog.category || prev?.primaryCategory || 'Luxury Travel',
            categories: res.blog.categories || prev?.categories || [res.blog.category || 'Luxury Travel'],
          }));
          if (res.related?.length > 0) {
            setLiveRelated(res.related);
          }
        }
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [cleanSlug]);

  // Related posts selection
  const relatedPosts = useMemo(() => {
    if (liveRelated.length > 0) return liveRelated;
    if (!post) return [];
    return getRelatedBlogPosts(post.slug, post.primaryCategory || post.category, 3);
  }, [post, liveRelated]);

  // Dynamic Headings Extraction for Table of Contents (Both PortableText and HTML)
  const headings = useMemo(() => {
    if (!post) return [];

    // 1. PortableText blocks
    if (Array.isArray(post.body) && post.body.length > 0) {
      const list = [];
      post.body.forEach((block) => {
        if (block._type === 'block' && (block.style === 'h2' || block.style === 'h3')) {
          const text = block.children?.map((c) => c.text).join('') || '';
          if (text.trim()) {
            list.push({
              id: block.style === 'h2' ? `heading-h2-${slugify(text)}` : `heading-h3-${slugify(text)}`,
              text: text.trim(),
              level: block.style === 'h2' ? 2 : 3,
            });
          }
        }
      });
      return list;
    }

    // 2. HTML content string
    if (post.content && typeof post.content === 'string') {
      const list = [];
      let count = 0;
      const regex = /<(h[23])[^>]*>(.*?)<\/\1>/gi;
      let match;
      while ((match = regex.exec(post.content)) !== null) {
        count++;
        const tag = match[1].toLowerCase();
        const text = match[2].replace(/<[^>]+>/g, '').trim();
        if (text) {
          list.push({
            id: `section-heading-${count}-${slugify(text)}`,
            text,
            level: tag === 'h2' ? 2 : 3,
          });
        }
      }
      return list;
    }

    return [];
  }, [post]);

  // Processed HTML content injecting section IDs matching the TOC
  const processedContentHtml = useMemo(() => {
    if (!post?.content || typeof post.content !== 'string') return '';
    let count = 0;
    return post.content.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, text) => {
      count++;
      const cleanText = text.replace(/<[^>]+>/g, '').trim();
      const id = `section-heading-${count}-${slugify(cleanText)}`;
      // Check if ID already exists in attrs
      if (/id=["'][^"']*["']/i.test(attrs)) {
        return match;
      }
      return `<${tag} id="${id}" ${attrs}>${text}</${tag}>`;
    });
  }, [post?.content]);

  // Active TOC Highlight on Scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTocId(headings[i].id);
          return;
        }
      }
      if (headings[0]) {
        setActiveTocId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // Dynamic SEO & Metadata
  useEffect(() => {
    if (!post) return;

    document.title = post.seo?.title || `${post.title} | Vienna Day Trip`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = post.seo?.description || post.excerpt;

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    const keywordsVal = post.seo?.keywords || post.keywords;
    if (keywordsVal && (Array.isArray(keywordsVal) ? keywordsVal.length > 0 : keywordsVal)) {
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = Array.isArray(keywordsVal) ? keywordsVal.join(', ') : keywordsVal;
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = post.seo?.canonical || `https://viennadaytrip.com/blog/${post.slug}/`;

    let schemaScript = document.getElementById('blog-post-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'blog-post-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const featuredImgUrl = post.featuredImage || '';
    const absoluteImgUrl = featuredImgUrl.startsWith('http')
      ? featuredImgUrl
      : `https://viennadaytrip.com${featuredImgUrl}`;

    const schemaData = post.seo?.schema || {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      image: absoluteImgUrl,
      datePublished: post.rawDate,
      dateModified: post.modified || post.rawDate,
      author: {
        '@type': 'Person',
        name: post.author || 'Vienna Day Trip Editorial Team',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Vienna Day Trip',
        logo: {
          '@type': 'ImageObject',
          url: 'https://viennadaytrip.com/images/logo2.png',
        },
      },
      description: post.excerpt,
    };
    schemaScript.text = JSON.stringify(schemaData);

    const headScriptNode = injectApprovedScript(post.seo?.headScript, 'custom-head-script');
    const bodyScriptNode = injectApprovedScript(post.seo?.bodyScript, 'custom-body-script');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      const el = document.getElementById('blog-post-schema');
      if (el) el.remove();
      if (headScriptNode) headScriptNode.remove();
      if (bodyScriptNode) bodyScriptNode.remove();
    };
  }, [post]);

  // Handle Share Article
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  // Smooth scroll to heading
  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveTocId(id);
      setMobileTocOpen(false);
    }
  };

  // Loading state while fetching newly published or cloud articles
  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#FAF8F4', minHeight: '80vh', padding: '10rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>VIENNA DAY TRIP JOURNAL</div>
          <div
            style={{
              margin: '2rem auto',
              width: '40px',
              height: '40px',
              border: '3px solid rgba(198,156,80,0.2)',
              borderTop: '3px solid #C69C50',
              borderRadius: '50%',
              animation: 'vdtSpin 1s linear infinite'
            }}
          />
          <p style={{ fontFamily: 'Lora, Georgia, serif', color: '#62666D', fontSize: '1.05rem', fontStyle: 'italic' }}>
            Preparing your bespoke European travel journal...
          </p>
          <style>{`@keyframes vdtSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // If article not found
  if (!post) {
    return (
      <div style={{ backgroundColor: '#FAF8F4', minHeight: '80vh', padding: '10rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>ARTICLE NOT FOUND</div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.4rem', color: '#17191C', margin: '1rem 0' }}>
            Looking For An Inspiring Journey?
          </h1>
          <p style={{ fontFamily: 'Lora, Georgia, serif', color: '#62666D', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2rem' }}>
            The travel guide or story you are looking for might have been updated or moved. Explore our complete collection of Austrian travel insights.
          </p>
          <Link to="/blog/" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem' }}>
            Back to Travel Journal
          </Link>
        </div>
      </div>
    );
  }

  const portableTextComponents = createPortableTextComponents();

  return (
    <article className="vdt-article-page">
      {/* =========================================================================
          1. ARTICLE HEADER / MAGAZINE COVER STRIP
          ========================================================================= */}
      <header className="vdt-article-header">
        <div className="vdt-article-header-container">
          {/* Navigation Bar: Back Link & Share Action */}
          <div className="vdt-article-nav-strip">
            <Link to="/blog/" className="vdt-article-back-link">
              <ArrowLeft size={16} />
              <span>Back to Travel Journal</span>
            </Link>

            <button type="button" onClick={handleShare} className="vdt-article-share-btn">
              {copySuccess ? (
                <>
                  <Check size={14} style={{ color: '#C69C50' }} />
                  <span style={{ color: '#C69C50' }}>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share Article</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Category Pill */}
          <div className="vdt-article-category-badge">
            {post.primaryCategory || post.category || 'Luxury Travel Guide'}
          </div>

          {/* Large Magazine Title */}
          <h1 className="vdt-article-title">{post.title}</h1>

          {/* Optional Excerpt Subtitle */}
          {post.excerpt && (
            <p className="vdt-article-excerpt-lead">{post.excerpt}</p>
          )}

          {/* Editorial Metadata Strip */}
          <div className="vdt-article-meta-strip">
            <div className="vdt-article-meta-item">
              <User size={15} className="vdt-article-meta-icon" />
              <span style={{ fontWeight: 600, color: '#17191C' }}>
                {post.author || 'Vienna Day Trip Editorial Team'}
              </span>
            </div>

            <span className="vdt-article-meta-dot">•</span>

            <div className="vdt-article-meta-item">
              <Calendar size={15} className="vdt-article-meta-icon" />
              <span>{post.date || 'October 2026'}</span>
            </div>

            <span className="vdt-article-meta-dot">•</span>

            <div className="vdt-article-meta-item">
              <Clock size={15} className="vdt-article-meta-icon" />
              <span>{post.readTime || '6 min read'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN CONTENT LAYOUT (Reading Column 760-850px + Sticky Desktop Sidebar)
          ========================================================================= */}
      <main className="vdt-article-main-wrap">
        <div className="vdt-article-layout-grid">
          {/* Main Reading Column */}
          <div className="vdt-article-reading-col">
            {/* Prominent Featured Image (Uncropped preservation for text-embedded graphics) */}
            {post.featuredImage && (
              <div className="vdt-article-featured-frame">
                <img
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || post.title}
                  title={post.featuredImageTitle || undefined}
                  className="vdt-article-featured-img"
                />
                {post.featuredImageAlt && post.featuredImageAlt !== post.title && (
                  <div className="vdt-article-featured-caption">
                    <span>{post.featuredImageAlt}</span>
                    <span style={{ fontSize: '0.75rem', color: '#8E929B', fontStyle: 'normal' }}>
                      Vienna Day Trip Exclusive
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mobile / Tablet Accordion TOC (Displays when 2+ headings present) */}
            {headings.length >= 2 && (
              <div className="vdt-article-mobile-toc">
                <div
                  className="vdt-article-mobile-toc-header"
                  onClick={() => setMobileTocOpen(!mobileTocOpen)}
                >
                  <span className="vdt-article-mobile-toc-title">
                    <ListOrdered size={16} style={{ color: '#C69C50' }} />
                    <span>Table of Contents ({headings.length} Sections)</span>
                  </span>
                  {mobileTocOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {mobileTocOpen && (
                  <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #F0ECE4' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {headings.map((h, idx) => (
                        <li key={h.id}>
                          <button
                            type="button"
                            onClick={() => scrollToHeading(h.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              padding: '0.35rem 0',
                              fontFamily: 'Lora, Georgia, serif',
                              fontSize: '0.92rem',
                              color: activeTocId === h.id ? '#C69C50' : '#2B2F36',
                              fontWeight: activeTocId === h.id ? 700 : 400,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                              width: '100%',
                            }}
                          >
                            <span style={{ color: '#C69C50', fontWeight: 700, fontSize: '0.8rem', marginTop: '1px' }}>
                              {idx + 1}.
                            </span>
                            <span>{h.text}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Dual-Mode Article Content Rendering: PortableText vs HTML */}
            <div className="vdt-article-body">
              {Array.isArray(post.body) && post.body.length > 0 ? (
                <PortableText value={post.body} components={portableTextComponents} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: processedContentHtml || post.content }} />
              )}
            </div>

            {/* Article Footer Strip */}
            <div className="vdt-article-footer-strip">
              {/* Category / Topic Tags */}
              {post.categories && post.categories.length > 0 && (
                <div className="vdt-article-topics-wrap">
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#17191C', fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '0.92rem' }}>
                    <Tag size={15} style={{ color: '#C69C50' }} />
                    <span>Topics:</span>
                  </div>
                  {post.categories.map((c) => (
                    <span key={c} className="vdt-article-topic-pill">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {/* Author Signature & Quality Card */}
              <div className="vdt-article-author-card">
                <div className="vdt-article-author-avatar">
                  <Award size={32} />
                </div>
                <div>
                  <h4 className="vdt-article-author-name">
                    {post.author || 'Vienna Day Trip Editorial Team'}
                  </h4>
                  <p className="vdt-article-author-bio">
                    Written and curated by Vienna Day Trip’s editorial team and licensed Austrian chauffeurs.
                    Providing bespoke private chauffeur tours, luxury airport transfers, and tailored European journeys from Vienna since 2019.
                  </p>
                </div>
              </div>

              {/* Back to Travel Journal */}
              <div>
                <Link
                  to="/blog/"
                  className="btn btn-outline"
                  style={{
                    padding: '0.85rem 1.85rem',
                    fontSize: '0.92rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Travel Journal</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Sticky Sidebar (>= 1024px) */}
          <aside className="vdt-article-sidebar">
            {/* Table of Contents Widget */}
            {headings.length >= 2 && (
              <div className="vdt-sidebar-card">
                <div className="vdt-sidebar-card-header">
                  <ListOrdered size={16} style={{ color: '#C69C50' }} />
                  <span className="vdt-sidebar-card-title">Table of Contents</span>
                </div>
                <ol className="vdt-sidebar-toc-list">
                  {headings.map((h, idx) => (
                    <li key={h.id} className="vdt-sidebar-toc-item">
                      <a
                        href={`#${h.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToHeading(h.id);
                        }}
                        className={`vdt-sidebar-toc-link ${activeTocId === h.id ? 'active' : ''}`}
                        style={{ paddingLeft: h.level === 3 ? '1.5rem' : '0.65rem' }}
                      >
                        <span className="vdt-sidebar-toc-num">{idx + 1}.</span>
                        <span>{h.text}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* VIP Chauffeur Booking Mini Card */}
            <div className="vdt-sidebar-cta-card">
              <div className="vdt-sidebar-cta-badge">
                <Sparkles size={12} />
                <span>PRIVATE CHAUFFEUR VIENNA</span>
              </div>
              <h3 className="vdt-sidebar-cta-title">
                Experience Austria in Pure Mercedes Comfort
              </h3>
              <p className="vdt-sidebar-cta-desc">
                Hotel pickup, luggage assistance, personalized pacing, and pristine Mercedes-Benz E, S, or V-Class vehicles.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem', fontSize: '0.86rem' }}
                >
                  <MessageSquare size={15} />
                  <span>Chat on WhatsApp</span>
                </a>
                <Link
                  to="/day-trips/"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem', fontSize: '0.86rem' }}
                >
                  <span>Explore Day Trips</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Related Travel Stories in Sidebar */}
            {relatedPosts.length > 0 && (
              <div className="vdt-sidebar-card">
                <div className="vdt-sidebar-card-header">
                  <Compass size={16} style={{ color: '#C69C50' }} />
                  <span className="vdt-sidebar-card-title">More Travel Stories</span>
                </div>
                <div>
                  {relatedPosts.slice(0, 3).map((rel) => (
                    <Link
                      key={rel.slug}
                      to={`/blog/${rel.slug}/`}
                      className="vdt-sidebar-story-item"
                    >
                      <div className="vdt-sidebar-story-thumb">
                        <img
                          src={rel.featuredImage}
                          alt={rel.title}
                          loading="lazy"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: '#C69C50', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '2px' }}>
                          {rel.primaryCategory || rel.category || 'Travel Story'}
                        </div>
                        <div className="vdt-sidebar-story-title">{rel.title}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* =========================================================================
          3. GRAND CONCLUSION CTA SECTION (Black / Champagne Gold Luxury)
          ========================================================================= */}
      <section className="vdt-article-conclusion-cta">
        <div className="vdt-article-conclusion-container">
          <div className="vdt-article-conclusion-eyebrow">
            <Sparkles size={14} />
            <span>VIENNA DAY TRIP PRIVATE CHAUFFEUR</span>
            <Sparkles size={14} />
          </div>

          <h2 className="vdt-article-conclusion-title">
            Explore Vienna & Beyond in Exceptional Comfort
          </h2>

          <p className="vdt-article-conclusion-desc">
            Turn your travel dreams into an effortless bespoke journey. Enjoy direct hotel-to-destination transfers,
            flexible private itineraries, and spotless Mercedes-Benz luxury.
          </p>

          <div className="vdt-article-conclusion-actions">
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                padding: '0.95rem 2.2rem',
                fontSize: '0.96rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <MessageSquare size={18} />
              <span>Plan Your Private Journey</span>
            </a>

            <Link
              to="/day-trips/"
              className="btn btn-outline"
              style={{
                padding: '0.95rem 2rem',
                fontSize: '0.96rem',
                borderColor: '#C69C50',
                color: '#FAF8F4',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>View Day Trip Rates</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Quality highlights strip */}
          <div className="vdt-article-conclusion-trust">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle2 size={16} />
              <span>Fixed Upfront Pricing</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <ShieldCheck size={16} />
              <span>Licensed Austrian Chauffeurs</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <Clock size={16} />
              <span>24/7 Priority Dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. RELATED ARTICLES (3 Posts from Same Category)
          ========================================================================= */}
      {relatedPosts.length > 0 && (
        <section className="vdt-article-related-section">
          <div className="vdt-article-related-container">
            <div className="vdt-article-related-header">
              <div className="eyebrow" style={{ justifyContent: 'center' }}>CONTINUE EXPLORING</div>
              <h3 className="vdt-article-related-title">Related Travel Stories</h3>
            </div>

            <div className="vdt-article-related-grid">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/blog/${rel.slug}/`}
                  className="vdt-article-related-card"
                >
                  <div className="vdt-article-related-card-img-wrap">
                    <img
                      src={rel.featuredImage}
                      alt={rel.featuredImageAlt || rel.title}
                      loading="lazy"
                    />
                  </div>

                  <div className="vdt-article-related-card-body">
                    <div className="vdt-article-related-card-cat">
                      {rel.primaryCategory || rel.category || 'Luxury Travel'}
                    </div>

                    <h4 className="vdt-article-related-card-title">{rel.title}</h4>

                    <div className="vdt-article-related-card-footer">
                      <span>Read Story</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
