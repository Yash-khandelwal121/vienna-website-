import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Tag, Share2, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, MessageSquare } from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { getBlogPostBySlug, getRelatedBlogPosts } from '../data/blogs';
import { siteConfig } from '../data/site';
import { useLanguage } from '../context/LanguageContext';
import { fetchPublicBlogBySlug } from '../services/api';
import { urlForImage } from '../sanity/client';

/**
 * Custom Portable Text rendering components matching Vienna Day Trip luxury aesthetics
 */
const portableTextComponents = {
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
        <div
          style={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            margin: '2.25rem 0',
            borderRadius: '12px',
            border: '1px solid #E6D8C3',
            boxShadow: '0 4px 18px rgba(23, 25, 28, 0.04)',
            backgroundColor: '#FFFFFF',
          }}
        >
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
                        padding: '0.9rem 1.15rem',
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontWeight: 700,
                        color: '#17191C',
                        fontSize: '0.98rem',
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
                        padding: '0.85rem 1.15rem',
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
    h2: ({ children }) => (
      <h2
        style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: 'clamp(1.5rem, 2.6vw, 1.95rem)',
          fontWeight: 800,
          color: '#17191C',
          letterSpacing: '-0.01em',
          margin: '2.75rem 0 1.1rem',
          lineHeight: 1.3,
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: 'clamp(1.25rem, 2.1vw, 1.55rem)',
          fontWeight: 700,
          color: '#17191C',
          margin: '2.25rem 0 0.9rem',
          lineHeight: 1.35,
        }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: '#C69C50',
          margin: '1.85rem 0 0.75rem',
          lineHeight: 1.4,
        }}
      >
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: '3px solid #C69C50',
          padding: '1.35rem 1.85rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '0 12px 12px 0',
          fontStyle: 'italic',
          margin: '2.25rem 0',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.03)',
          color: '#17191C',
          lineHeight: 1.8,
        }}
      >
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p style={{ marginBottom: '1.6rem', lineHeight: 1.85, color: '#2B2F36' }}>
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul
        style={{
          paddingLeft: '1.75rem',
          marginBottom: '1.75rem',
          listStyleType: 'disc',
          color: '#2B2F36',
          lineHeight: 1.85,
        }}
      >
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol
        style={{
          paddingLeft: '1.75rem',
          marginBottom: '1.75rem',
          listStyleType: 'decimal',
          color: '#2B2F36',
          lineHeight: 1.85,
        }}
      >
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li style={{ marginBottom: '0.55rem' }}>{children}</li>,
    number: ({ children }) => <li style={{ marginBottom: '0.55rem' }}>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#17191C' }}>{children}</strong>,
    em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
    link: ({ value, children }) => {
      const href = value?.href || '#';
      const isExternal = href.startsWith('http');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          style={{
            color: '#C69C50',
            textDecoration: 'underline',
            fontWeight: 500,
            textUnderlineOffset: '3px',
          }}
        >
          {children}
        </a>
      );
    },
    internalLink: ({ value, children }) => {
      const slug = value?.reference?.slug?.current || value?.slug;
      const to = slug ? `/blog/${slug}/` : '#';
      return (
        <Link
          to={to}
          style={{
            color: '#C69C50',
            textDecoration: 'underline',
            fontWeight: 500,
            textUnderlineOffset: '3px',
          }}
        >
          {children}
        </Link>
      );
    },
  },
};

/**
 * Safely parse and inject custom approved scripts (JSON-LD or validated domains)
 */
function injectApprovedScript(scriptContent, elementId) {
  if (!scriptContent || typeof scriptContent !== 'string') return null;
  const trimmed = scriptContent.trim();
  if (!trimmed) return null;

  // Controlled verification 1: JSON-LD snippet
  const jsonLdMatch = trimmed.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      JSON.parse(jsonLdMatch[1]); // Ensure valid JSON
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

  // Controlled verification 2: Approved whitelist script URL (Google Analytics / GTM)
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

  console.warn(`[Security] Custom script rejected: Unapproved script signature.`);
  return null;
}

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [post, setPost] = React.useState(() => getBlogPostBySlug(slug));
  const [liveRelated, setLiveRelated] = React.useState([]);

  useEffect(() => {
    const local = getBlogPostBySlug(slug);
    if (local) setPost(local);

    let isMounted = true;
    fetchPublicBlogBySlug(slug).then((res) => {
      if (isMounted && res?.blog) {
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
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const relatedPosts = useMemo(() => {
    if (liveRelated.length > 0) return liveRelated;
    if (!post) return [];
    return getRelatedBlogPosts(post.slug, post.primaryCategory || post.category, 3);
  }, [post, liveRelated]);

  // Dynamic SEO Tags & Schema injection
  useEffect(() => {
    if (!post) return;

    // Document title
    document.title = post.seo?.title || `${post.title} | Vienna Day Trip`;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = post.seo?.description || post.excerpt;

    // Meta Keywords
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

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = post.seo?.canonical || `https://viennadaytrip.com/blog/${post.slug}/`;

    // JSON-LD Structured Data
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

    // Controlled Custom Head Script Injection
    const headScriptNode = injectApprovedScript(post.seo?.headScript, 'custom-head-script');
    const bodyScriptNode = injectApprovedScript(post.seo?.bodyScript, 'custom-body-script');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      // Cleanup custom schema and scripts on unmount
      const el = document.getElementById('blog-post-schema');
      if (el) el.remove();
      if (headScriptNode) headScriptNode.remove();
      if (bodyScriptNode) bodyScriptNode.remove();
    };
  }, [post]);

  // Handle WhatsApp Share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  // If article not found
  if (!post) {
    return (
      <div style={{ backgroundColor: '#FAF8F4', minHeight: '80vh', padding: '10rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>ARTICLE NOT FOUND</div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.4rem', color: '#17191C', margin: '1rem 0' }}>
            Looking For An Inspiring Journey?
          </h1>
          <p style={{ fontFamily: 'Lora, Georgia, serif', color: '#62666D', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2rem' }}>
            The travel guide or article you are looking for might have been moved or updated. Explore our complete collection in the Travel Journal.
          </p>
          <Link to="/blog/" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem' }}>
            Back to Travel Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FAF8F4', minHeight: '100vh', color: '#17191C' }}>
      {/* =========================================================================
          ARTICLE HEADER & HERO
          ========================================================================= */}
      <header
        style={{
          paddingTop: '8rem',
          paddingBottom: '3.5rem',
          backgroundColor: '#FAF8F4',
          borderBottom: '1px solid #E6D8C3'
        }}
      >
        <div className="container-wide" style={{ maxWidth: '860px', margin: '0 auto' }}>
          {/* Back Button & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <Link
              to="/blog/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '0.88rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#C69C50',
                textDecoration: 'none',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <ArrowLeft size={16} />
              <span>Back to Travel Journal</span>
            </Link>

            {/* Share Article Action */}
            <button
              type="button"
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E6D8C3',
                borderRadius: '9999px',
                padding: '0.4rem 0.95rem',
                fontFamily: 'Lora, Georgia, serif',
                fontSize: '0.84rem',
                color: '#62666D',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C69C50';
                e.currentTarget.style.color = '#C69C50';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E6D8C3';
                e.currentTarget.style.color = '#62666D';
              }}
            >
              <Share2 size={14} />
              <span>Share Article</span>
            </button>
          </div>

          {/* Primary Category Pill */}
          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(198, 156, 80, 0.1)',
              border: '1px solid rgba(198, 156, 80, 0.4)',
              color: '#C69C50',
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              marginBottom: '1.25rem'
            }}
          >
            {post.primaryCategory}
          </div>

          {/* Article Title */}
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(2.1rem, 4.2vw, 3.2rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#17191C',
              letterSpacing: '-0.01em',
              marginBottom: '1.75rem'
            }}
          >
            {post.title}
          </h1>

          {/* Author and Metadata Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #E6D8C3',
              color: '#62666D',
              fontSize: '0.92rem',
              fontFamily: 'Lora, Georgia, serif'
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <User size={15} style={{ color: '#C69C50' }} />
              <span style={{ fontWeight: 600, color: '#17191C' }}>{post.author}</span>
            </div>

            <span>•</span>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <Calendar size={15} style={{ color: '#C69C50' }} />
              <span>{post.date}</span>
            </div>

            <span>•</span>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <Clock size={15} style={{ color: '#C69C50' }} />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          FEATURED IMAGE & ARTICLE CONTENT (Comfortable 820px Reading Width)
          ========================================================================= */}
      <main style={{ padding: '3.5rem 0 5rem' }}>
        <div className="container-wide" style={{ maxWidth: '820px', margin: '0 auto' }}>
          {/* Featured Hero Photo */}
          {post.featuredImage && (
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #E6D8C3',
                backgroundColor: '#0E1013',
                marginBottom: '3rem',
                boxShadow: '0 12px 35px rgba(23, 25, 28, 0.08)'
              }}
            >
              <img
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                title={post.featuredImageTitle || undefined}
                style={{
                  width: '100%',
                  maxHeight: '520px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              {post.featuredImageAlt && post.featuredImageAlt !== post.title && (
                <div
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#FFFFFF',
                    borderTop: '1px solid #E6D8C3',
                    fontFamily: 'Lora, Georgia, serif',
                    fontSize: '0.84rem',
                    color: '#62666D',
                    fontStyle: 'italic'
                  }}
                >
                  {post.featuredImageAlt}
                </div>
              )}
            </div>
          )}

          {/* Dual-Mode Article Content Rendering: Portable Text Visual Editor vs Legacy HTML */}
          {Array.isArray(post.body) && post.body.length > 0 ? (
            <div
              className="blog-article-content blog-portable-text"
              style={{
                fontFamily: 'Lora, Georgia, serif',
                fontSize: '1.12rem',
                lineHeight: '1.85',
                color: '#2B2F36'
              }}
            >
              <PortableText value={post.body} components={portableTextComponents} />
            </div>
          ) : (
            <div
              className="blog-article-content blog-legacy-html"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{
                fontFamily: 'Lora, Georgia, serif',
                fontSize: '1.12rem',
                lineHeight: '1.85',
                color: '#2B2F36'
              }}
            />
          )}

          {/* Categories & Tags Footer */}
          {post.categories && post.categories.length > 0 && (
            <div
              style={{
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid #E6D8C3',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.65rem'
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#17191C', fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '0.92rem' }}>
                <Tag size={15} style={{ color: '#C69C50' }} />
                <span>Topics:</span>
              </div>
              {post.categories.map((c) => (
                <span
                  key={c}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E6D8C3',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontFamily: 'Lora, Georgia, serif',
                    color: '#62666D'
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Back to Blog button at bottom of article */}
          <div style={{ marginTop: '2.5rem' }}>
            <Link
              to="/blog/"
              className="btn btn-outline"
              style={{
                padding: '0.8rem 1.8rem',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Travel Journal</span>
            </Link>
          </div>
        </div>
      </main>

      {/* =========================================================================
          REQUIREMENT 10: PREMIUM BOOKING CTA AT BOTTOM OF BLOG DETAIL
          ========================================================================= */}
      <section
        style={{
          backgroundColor: '#0E1013',
          color: '#FAF8F4',
          padding: '5rem 0',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid #C69C50',
          borderBottom: '1px solid #C69C50'
        }}
      >
        <div className="container-wide" style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#C69C50',
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '0.82rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '1rem'
            }}
          >
            <Sparkles size={14} style={{ color: '#C69C50' }} />
            <span>VIENNA DAY TRIP PRIVATE CHAUFFEUR</span>
            <Sparkles size={14} style={{ color: '#C69C50' }} />
          </div>

          <h2
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(2rem, 3.8vw, 2.85rem)',
              fontWeight: 800,
              color: '#FAF8F4',
              lineHeight: 1.25,
              marginBottom: '1.25rem'
            }}
          >
            Explore Europe in Exceptional Comfort
          </h2>

          <p
            style={{
              fontFamily: 'Lora, Georgia, serif',
              fontSize: '1.1rem',
              lineHeight: 1.75,
              color: '#B5BAC2',
              maxWidth: '680px',
              margin: '0 auto 2.5rem'
            }}
          >
            Turn your travel dreams into an effortless bespoke journey. Enjoy direct hotel-to-destination transfers, flexible private itineraries, and spotless Mercedes-Benz luxury.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                padding: '0.95rem 2.2rem',
                fontSize: '0.96rem',
                fontFamily: 'Playfair Display, Georgia, serif',
                fontWeight: 700,
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <MessageSquare size={18} />
              <span>Plan Your Private Journey</span>
            </a>

            <Link
              to="/tour-pricing/"
              className="btn btn-outline"
              style={{
                padding: '0.95rem 2rem',
                fontSize: '0.96rem',
                borderColor: '#C69C50',
                color: '#FAF8F4'
              }}
            >
              <span>View Day Trip Rates</span>
            </Link>
          </div>

          {/* Quality highlights strip */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '2rem',
              marginTop: '3rem',
              paddingTop: '2.5rem',
              borderTop: '1px solid rgba(198, 156, 80, 0.25)',
              color: '#C69C50',
              fontSize: '0.86rem',
              fontFamily: 'Lora, Georgia, serif'
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} />
              <span>Fixed Upfront Pricing</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={15} />
              <span>Licensed Austrian Chauffeurs</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} />
              <span>24/7 Priority Dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          REQUIREMENT 6: RELATED ARTICLES (3 Posts from Same Category)
          ========================================================================= */}
      {relatedPosts.length > 0 && (
        <section style={{ padding: '5rem 0 6rem', backgroundColor: '#FAF8F4' }}>
          <div className="container-wide">
            <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>CONTINUE EXPLORING</div>
              <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.1rem', fontWeight: 800, color: '#17191C' }}>
                Related Travel Stories
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '2.25rem'
              }}
            >
              {relatedPosts.map((rel) => (
                <article
                  key={rel.slug}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E6D8C3',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 6px 25px rgba(23, 25, 28, 0.04)',
                    transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(23, 25, 28, 0.08)';
                    e.currentTarget.style.borderColor = '#C69C50';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(23, 25, 28, 0.04)';
                    e.currentTarget.style.borderColor = '#E6D8C3';
                  }}
                >
                  <Link
                    to={`/blog/${rel.slug}/`}
                    style={{
                      height: '210px',
                      overflow: 'hidden',
                      display: 'block',
                      backgroundColor: '#0E1013'
                    }}
                  >
                    <img
                      src={rel.featuredImage}
                      alt={rel.featuredImageAlt || rel.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.4s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                    />
                  </Link>

                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ color: '#C69C50', fontSize: '0.75rem', fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                      {rel.primaryCategory}
                    </div>

                    <h4
                      style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        lineHeight: 1.35,
                        color: '#17191C',
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      <Link to={`/blog/${rel.slug}/`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {rel.title}
                      </Link>
                    </h4>

                    <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid #F0ECE4' }}>
                      <Link
                        to={`/blog/${rel.slug}/`}
                        style={{
                          fontFamily: 'Playfair Display, Georgia, serif',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          color: '#C69C50',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <span>Read More</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .blog-article-content {
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .blog-article-content img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 12px;
          margin: 1.5rem 0;
          display: block;
        }

        .blog-article-content figure {
          max-width: 100% !important;
          margin: 1.5rem 0;
        }

        .blog-article-content table {
          display: block;
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-collapse: collapse;
          margin: 2rem 0;
          background: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 8px;
        }

        .blog-article-content th,
        .blog-article-content td {
          padding: 0.75rem 1rem;
          border: 1px solid #E6D8C3;
          font-size: 0.95rem;
        }

        .blog-article-content th {
          background-color: #FAF8F4;
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          color: #17191C;
        }

        .blog-article-content iframe,
        .blog-article-content video {
          max-width: 100% !important;
          border-radius: 12px;
          margin: 1.5rem 0;
        }

        .blog-article-content h2,
        .blog-article-content h3,
        .blog-article-content h4 {
          font-family: 'Playfair Display', Georgia, serif;
          color: #17191C;
          margin: 2.2rem 0 1rem;
          line-height: 1.3;
        }

        .blog-article-content h2 {
          font-size: clamp(1.4rem, 2.5vw, 1.85rem);
        }

        .blog-article-content h3 {
          font-size: clamp(1.2rem, 2vw, 1.45rem);
        }

        .blog-article-content p {
          margin-bottom: 1.5rem;
        }

        .blog-article-content ul,
        .blog-article-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .blog-article-content li {
          margin-bottom: 0.5rem;
        }

        .blog-article-content blockquote {
          border-left: 3px solid #C69C50;
          padding: 1.25rem 1.75rem;
          background: #FFFFFF;
          border-radius: 0 12px 12px 0;
          font-style: italic;
          margin: 2rem 0;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
        }

        .blog-article-content a {
          color: #C69C50;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
