import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { allBlogPosts, blogCategories } from '../data/blogs';
import { useLanguage } from '../context/LanguageContext';

const POSTS_PER_PAGE = 9;

export default function Blog() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // SEO document title & meta tags
  useEffect(() => {
    document.title = 'The Vienna Travel Journal | Vienna Day Trip Luxury Insights';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = 'Discover inspiring destinations, travel guides, and luxury chauffeur experiences across Vienna, Austria, and Central Europe.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedCategory]);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  // Filtered posts based on search query and category
  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allBlogPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        post.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase()) ||
        post.primaryCategory.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;
      if (!query) return true;

      const titleMatch = post.title.toLowerCase().includes(query);
      const excerptMatch = post.excerpt.toLowerCase().includes(query);
      const categoryMatch = post.categories.some((c) => c.toLowerCase().includes(query));
      return titleMatch || excerptMatch || categoryMatch;
    });
  }, [search, selectedCategory]);

  // Pagination calculation
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <div style={{ backgroundColor: '#FAF8F4', minHeight: '100vh', color: '#17191C' }}>
      {/* =========================================================================
          HERO SECTION: THE VIENNA TRAVEL JOURNAL
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          paddingTop: '8.5rem',
          paddingBottom: '4.5rem',
          backgroundColor: '#FAF8F4',
          borderBottom: '1px solid #E6D8C3'
        }}
      >
        <div className="container-wide" style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto' }}>
          {/* Eyebrow */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#C69C50',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.82rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '1rem'
            }}
          >
            <Sparkles size={14} style={{ color: '#C69C50' }} />
            <span>DISPATCHES & CURATED GUIDES</span>
            <Sparkles size={14} style={{ color: '#C69C50' }} />
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#17191C',
              letterSpacing: '-0.01em',
              marginBottom: '1.25rem'
            }}
          >
            The Vienna Travel Journal
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: 'Lora, Georgia, serif',
              fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
              lineHeight: 1.7,
              color: '#62666D',
              maxWidth: '720px',
              margin: '0 auto 2.5rem'
            }}
          >
            Discover inspiring destinations, travel guides, and luxury chauffeur experiences across Europe.
          </p>

          {/* Search Bar */}
          <div
            style={{
              position: 'relative',
              maxWidth: '620px',
              margin: '0 auto',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E6D8C3',
              borderRadius: '9999px',
              padding: '0.5rem 0.75rem 0.5rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 8px 30px rgba(23, 25, 28, 0.05)',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
          >
            <Search size={20} style={{ color: '#C69C50', flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides, destinations, or chauffeur tips..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontFamily: 'Lora, Georgia, serif',
                fontSize: '1rem',
                color: '#17191C',
                backgroundColor: 'transparent'
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8E929B',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CATEGORY FILTER STRIP
          ========================================================================= */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E6D8C3',
          padding: '1.25rem 0',
          position: 'sticky',
          top: '74px',
          zIndex: 40,
          backdropFilter: 'blur(8px)'
        }}
      >
        <div className="container-wide">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              scrollbarWidth: 'none'
            }}
          >
            {/* "All" Category Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '0.88rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: '0.55rem 1.15rem',
                borderRadius: '9999px',
                border: selectedCategory === 'All' ? '1.5px solid #C69C50' : '1px solid #E6D8C3',
                backgroundColor: selectedCategory === 'All' ? '#C69C50' : '#FAF8F4',
                color: selectedCategory === 'All' ? '#FFFFFF' : '#17191C',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <span>All Articles</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  backgroundColor: selectedCategory === 'All' ? 'rgba(255,255,255,0.25)' : '#E6D8C3',
                  color: selectedCategory === 'All' ? '#FFFFFF' : '#62666D'
                }}
              >
                {allBlogPosts.length}
              </span>
            </button>

            {/* Individual Category Pills */}
            {blogCategories.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '9999px',
                    border: active ? '1.5px solid #C69C50' : '1px solid #E6D8C3',
                    backgroundColor: active ? '#C69C50' : '#FAF8F4',
                    color: active ? '#FFFFFF' : '#17191C',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <span>{cat.name}</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#E6D8C3',
                      color: active ? '#FFFFFF' : '#62666D'
                    }}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN BLOG GRID: 3 COLS (DESKTOP) / 2 COLS (TABLET) / 1 COL (MOBILE)
          ========================================================================= */}
      <section style={{ padding: '4.5rem 0 6rem' }}>
        <div className="container-wide">
          {/* Header Info Strip */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2.5rem',
              borderBottom: '1px solid #E6D8C3',
              paddingBottom: '1rem'
            }}
          >
            <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.15rem', color: '#17191C', fontWeight: 700 }}>
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'Article' : 'Articles'}
              {selectedCategory !== 'All' && <span style={{ color: '#C69C50' }}> in {selectedCategory}</span>}
              {search && <span style={{ color: '#62666D', fontWeight: 400 }}> matching "{search}"</span>}
            </div>

            <div style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '0.9rem', color: '#62666D' }}>
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '5rem 2rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E6D8C3',
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              <Search size={44} style={{ color: '#C69C50', opacity: 0.6, marginBottom: '1.25rem' }} />
              <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.5rem', color: '#17191C', marginBottom: '0.75rem' }}>
                No Articles Found
              </h3>
              <p style={{ fontFamily: 'Lora, Georgia, serif', color: '#62666D', fontSize: '0.98rem', marginBottom: '1.75rem' }}>
                We couldn't find any articles matching your search criteria. Try a different search term or reset the category filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="btn btn-primary"
                style={{ padding: '0.7rem 1.6rem', fontSize: '0.88rem' }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Responsive Blog Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
          <div className="blog-posts-grid">
            {currentPosts.map((post) => (
              <article
                key={post.slug}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E6D8C3',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 30px rgba(23, 25, 28, 0.04)',
                  transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 18px 45px rgba(23, 25, 28, 0.1)';
                  e.currentTarget.style.borderColor = '#C69C50';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(23, 25, 28, 0.04)';
                  e.currentTarget.style.borderColor = '#E6D8C3';
                }}
              >
                {/* Featured Image Frame */}
                <Link
                  to={`/blog/${post.slug}/`}
                  style={{
                    position: 'relative',
                    height: '240px',
                    overflow: 'hidden',
                    display: 'block',
                    backgroundColor: '#0E1013',
                    textDecoration: 'none'
                  }}
                >
                  <img
                    src={post.featuredImage}
                    alt={post.featuredImageAlt || post.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  {/* Category Pill Tag Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      backgroundColor: 'rgba(250, 248, 244, 0.95)',
                      backdropFilter: 'blur(6px)',
                      color: '#17191C',
                      border: '1px solid #E6D8C3',
                      fontFamily: 'Playfair Display, Georgia, serif',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    {post.primaryCategory}
                  </div>
                </Link>

                {/* Card Body */}
                <div
                  style={{
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1
                  }}
                >
                  {/* Meta Strip: Date & Reading Time */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      color: '#8E929B',
                      fontSize: '0.82rem',
                      fontFamily: 'Lora, Georgia, serif',
                      marginBottom: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} style={{ color: '#C69C50' }} />
                      <span>{post.date}</span>
                    </div>
                    <span>•</span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} style={{ color: '#C69C50' }} />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      fontFamily: 'Playfair Display, Georgia, serif',
                      fontSize: '1.32rem',
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: '#17191C',
                      marginBottom: '0.85rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    <Link
                      to={`/blog/${post.slug}/`}
                      style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#C69C50')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#17191C')}
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p
                    style={{
                      fontFamily: 'Lora, Georgia, serif',
                      fontSize: '0.94rem',
                      lineHeight: 1.65,
                      color: '#62666D',
                      marginBottom: '1.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flexGrow: 1
                    }}
                  >
                    {post.excerpt}
                  </p>

                  {/* Footer Action: Read Article */}
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid #F0ECE4' }}>
                    <Link
                      to={`/blog/${post.slug}/`}
                      style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        color: '#C69C50',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'gap 0.2s ease, color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.gap = '0.75rem';
                        e.currentTarget.style.color = '#B58B3F';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.gap = '0.5rem';
                        e.currentTarget.style.color = '#C69C50';
                      }}
                    >
                      <span>Read Article</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* =========================================================================
              PAGINATION CONTROLS
              ========================================================================= */}
          {totalPages > 1 && (
            <div
              style={{
                marginTop: '4rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}
            >
              {/* Previous Page */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #E6D8C3',
                  backgroundColor: currentPage === 1 ? '#F5F1E9' : '#FFFFFF',
                  color: currentPage === 1 ? '#8E929B' : '#17191C',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Keep first, last, and window around current page
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  );
                })
                .map((page, idx, arr) => {
                  const showEllipsisBefore = idx > 0 && page > arr[idx - 1] + 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsisBefore && (
                        <span style={{ color: '#8E929B', padding: '0 0.4rem', fontFamily: 'Lora, Georgia, serif' }}>
                          ...
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          border: currentPage === page ? '1.5px solid #C69C50' : '1px solid #E6D8C3',
                          backgroundColor: currentPage === page ? '#C69C50' : '#FFFFFF',
                          color: currentPage === page ? '#FFFFFF' : '#17191C',
                          cursor: 'pointer',
                          fontFamily: 'Playfair Display, Georgia, serif',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          transition: 'all 0.15s'
                        }}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

              {/* Next Page */}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #E6D8C3',
                  backgroundColor: currentPage === totalPages ? '#F5F1E9' : '#FFFFFF',
                  color: currentPage === totalPages ? '#8E929B' : '#17191C',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .blog-posts-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 2.25rem;
        }

        @media (max-width: 1024px) {
          .blog-posts-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1.75rem;
          }
        }

        @media (max-width: 640px) {
          .blog-posts-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
