import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { allBlogPosts, blogCategories } from '../data/blogs';
import { useLanguage } from '../context/LanguageContext';
import { fetchPublicBlogs } from '../services/api';
import BlogCoverImage from '../components/BlogCoverImage';
import './Blog.css';

const POSTS_PER_PAGE = 9;

export default function Blog() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [livePosts, setLivePosts] = useState(allBlogPosts);
  const [isLoading, setIsLoading] = useState(false);
  const journalRef = useRef(null);

  // Translation helpers
  const getCategoryLabel = (catName) => {
    if (!catName) return t('blog_guide_badge');
    const lower = String(catName).toLowerCase().trim();
    if (lower === 'all' || lower === 'all articles') return t('blog_all_articles');
    if (lower === 'our blog') return t('blog_cat_our_blog');
    if (lower === 'chauffeur') return t('blog_cat_chauffeur');
    if (lower === 'car rent') return t('blog_cat_car_rent');
    if (lower === 'services') return t('blog_cat_services');
    if (lower === 'general') return t('blog_cat_general');
    if (lower === 'uncategorized') return t('blog_cat_uncategorized');
    return catName;
  };

  const formatReadTime = (readTimeStr) => {
    if (!readTimeStr) return '';
    const num = parseInt(readTimeStr, 10);
    if (!isNaN(num)) {
      return `${num} ${t('blog_min_read')}`;
    }
    return readTimeStr;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const locale = language === 'de' ? 'de-AT' : (language === 'zh-CN' ? 'zh-CN' : (language === 'fr' ? 'fr-FR' : (language === 'it' ? 'it-IT' : (language === 'es' ? 'es-ES' : 'en-US'))));
        return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
      }
    } catch (e) {}
    return dateStr;
  };

  // SEO document title & meta tags
  useEffect(() => {
    if (language === 'de') {
      document.title = 'Geschichten, für die es sich zu reisen lohnt | The Vienna Day Trip Journal';
    } else {
      document.title = 'Stories Worth Travelling For | The Vienna Day Trip Journal';
    }
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = t('blog_hero_desc');
  }, [language, t]);

  // Sync with Sanity CMS & Backend API
  useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      setIsLoading(true);
      try {
        const res = await fetchPublicBlogs({ limit: 200, category: selectedCategory, search });
        if (isMounted && res?.blogs?.length > 0) {
          const mapped = res.blogs.map((b) => {
            const localMatch = allBlogPosts.find((p) => p.slug === b.slug);
            return {
              ...b,
              featuredImage: b.featuredImage || b.coverImage || localMatch?.featuredImage || '/images/gallery-hallstatt.webp',
              categories: b.categories || [b.category || 'Our Blog'],
              primaryCategory: b.category || b.categories?.[0] || 'Our Blog',
            };
          });
          setLivePosts(mapped);
        }
      } catch (e) {
        // preserve local fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadLiveData();
    return () => {
      isMounted = false;
    };
  }, [search, selectedCategory]);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  // Dynamic category list from data with actual counts
  const categoryCounts = useMemo(() => {
    const counts = { All: livePosts.length };
    livePosts.forEach((post) => {
      const cats = post.categories || [post.category || 'Our Blog'];
      cats.forEach((c) => {
        if (!c) return;
        counts[c] = (counts[c] || 0) + 1;
      });
      if (post.primaryCategory && !cats.includes(post.primaryCategory)) {
        counts[post.primaryCategory] = (counts[post.primaryCategory] || 0) + 1;
      }
    });
    return counts;
  }, [livePosts]);

  // Filtered posts based on search query and category
  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return livePosts.filter((post) => {
      const categories = post.categories || [post.category || 'Our Blog'];
      const primaryCat = post.primaryCategory || post.category || 'Our Blog';

      const matchesCategory =
        selectedCategory === 'All' ||
        categories.some((c) => c && c.toLowerCase() === selectedCategory.toLowerCase()) ||
        (primaryCat && primaryCat.toLowerCase() === selectedCategory.toLowerCase());

      if (!matchesCategory) return false;
      if (!query) return true;

      const titleMatch = post.title?.toLowerCase().includes(query);
      const excerptMatch = post.excerpt?.toLowerCase().includes(query);
      const categoryMatch = categories.some((c) => c && c.toLowerCase().includes(query));
      return titleMatch || excerptMatch || categoryMatch;
    });
  }, [search, selectedCategory, livePosts]);

  // Pagination calculation
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Featured and recommended articles (derived from filtered posts)
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const recommendedPosts = filteredPosts.length > 1 ? filteredPosts.slice(1, 5) : [];

  // Smooth scroll helper for pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (journalRef.current) {
      const yOffset = -90;
      const element = journalRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="vdt-blog-page">
      <div className="vdt-blog-container">
        {/* =========================================================================
            SECTION 1: BLOG HERO EDITORIAL SECTION (55% Content / 45% Image)
            ========================================================================= */}
        <section className="vdt-blog-hero-card" aria-label="Journal Hero">
          <div className="vdt-blog-hero-content">
            {/* Small Eyebrow Heading */}
            <div className="vdt-blog-hero-eyebrow">
              <Sparkles size={14} style={{ color: '#A67C38' }} />
              <span>{t('blog_hero_eyebrow')}</span>
            </div>

            {/* Main Editorial Heading */}
            <h1 className="vdt-blog-hero-title">
              {t('blog_hero_title_1')}<br />
              <span className="vdt-gold-text">{t('blog_hero_title_2')}</span>
            </h1>

            {/* Description */}
            <p className="vdt-blog-hero-desc">
              {t('blog_hero_desc')}
            </p>

            {/* Search Bar */}
            <div className="vdt-blog-search-box">
              <Search size={18} style={{ color: '#A67C38', flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('blog_search_placeholder')}
                className="vdt-blog-search-input"
                aria-label="Search articles"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="vdt-blog-search-clear"
                  title="Clear search"
                  aria-label="Clear search query"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                className="vdt-blog-search-btn"
                onClick={() => {
                  if (journalRef.current) {
                    journalRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                title="Search articles"
                aria-label="Submit search"
              >
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Category Filter Pills (Existing Sanity CMS Categories) */}
            <div className="vdt-hero-pills" role="tablist" aria-label="Article categories">
              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'All'}
                onClick={() => setSelectedCategory('All')}
                className={`vdt-pill-btn ${selectedCategory === 'All' ? 'active' : ''}`}
              >
                <span>{t('blog_all_articles')}</span>
                <span className="vdt-pill-badge">{totalPosts}</span>
              </button>

              {blogCategories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                const count = categoryCounts[cat.name] || cat.count || 0;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`vdt-pill-btn ${isActive ? 'active' : ''}`}
                  >
                    <span>{getCategoryLabel(cat.name)}</span>
                    <span className="vdt-pill-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Beautiful Vienna Architecture & Mercedes S-Class */}
          <div className="vdt-blog-hero-image-wrap">
            <img
              src="/images/vienna-hero-clean.jpg"
              alt="Imperial Vienna Hofburg Palace and luxury chauffeur Mercedes-Benz"
              className="vdt-blog-hero-image"
              loading="eager"
            />
            <div className="vdt-blog-hero-image-overlay" />
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: FEATURED BLOG SECTION (Separated Image & Content Architecture)
            ========================================================================= */}
        {featuredPost && (
          <section className="vdt-featured-section" aria-label="Featured Stories">
            <div className="vdt-featured-grid">
              {/* Left 60%: Large Featured Article Card (Dedicated Top Image & Bottom Content) */}
              <Link
                to={`/blog/${featuredPost.slug}/`}
                className="vdt-featured-card"
                aria-label={`Featured: ${featuredPost.title}`}
              >
                <BlogCoverImage
                  src={featuredPost.featuredImage}
                  alt={featuredPost.featuredImageAlt || featuredPost.title}
                  variant="featured"
                  isPoster={featuredPost.isPoster}
                  eager
                />

                <div className="vdt-featured-body">
                  <span className="vdt-featured-cat-badge">
                    {getCategoryLabel(featuredPost.primaryCategory)}
                  </span>

                  <h2 className="vdt-featured-title-new">
                    {featuredPost.title}
                  </h2>

                  <p className="vdt-featured-desc-new">
                    {featuredPost.excerpt}
                  </p>

                  <div className="vdt-featured-footer-new">
                    <div className="vdt-featured-meta-new">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} style={{ color: '#A67C38' }} />
                        <span>{formatDate(featuredPost.date)}</span>
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} style={{ color: '#A67C38' }} />
                        <span>{formatReadTime(featuredPost.readTime)}</span>
                      </span>
                    </div>

                    <span className="vdt-featured-cta-btn">
                      <span>{t('blog_read_article')}</span>
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Right 40%: Recommended Articles List */}
              <div className="vdt-recommended-card">
                <div className="vdt-recommended-header">
                  <span>{t('blog_recommended_stories')}</span>
                  <span style={{ fontSize: '0.8rem', color: '#A67C38', fontWeight: 600 }}>
                    {t('blog_editors_picks')}
                  </span>
                </div>

                <div className="vdt-recommended-list">
                  {recommendedPosts.map((recPost) => (
                    <Link
                      key={recPost.slug}
                      to={`/blog/${recPost.slug}/`}
                      className="vdt-recommended-item"
                    >
                      <BlogCoverImage
                        src={recPost.featuredImage}
                        alt={recPost.title}
                        variant="recommended"
                        isPoster={recPost.isPoster}
                      />

                      <div className="vdt-recommended-info">
                        <div className="vdt-recommended-cat">
                          {getCategoryLabel(recPost.primaryCategory)}
                        </div>
                        <h3 className="vdt-recommended-item-title">
                          {recPost.title}
                        </h3>
                        <div className="vdt-recommended-meta">
                          <span>{formatDate(recPost.date)}</span>
                          <span>•</span>
                          <span>{formatReadTime(recPost.readTime)}</span>
                        </div>
                      </div>

                      <div className="vdt-recommended-arrow">
                        <ArrowRight size={14} />
                      </div>
                    </Link>
                  ))}

                  {recommendedPosts.length === 0 && (
                    <div style={{ color: '#8E929B', fontSize: '0.9rem', padding: '1rem 0' }}>
                      More recommendations will appear here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION 3: EXPLORE OUR TRAVEL JOURNAL HEADER & CONTROLS
            ========================================================================= */}
        <section ref={journalRef} className="vdt-journal-header" id="journal-grid">
          <div className="vdt-journal-title-row">
            <div>
              <h2 className="vdt-journal-title">{t('blog_explore_title')}</h2>
              <p className="vdt-journal-subtitle">
                {t('blog_explore_sub')}
              </p>
            </div>

            {/* Quick Count & Search Summary */}
            <div className="vdt-journal-count-text">
              {t('blog_showing')} <span className="vdt-journal-count-highlight">{filteredPosts.length}</span> {filteredPosts.length === 1 ? t('blog_article_count') : t('blog_articles_count')}
              {selectedCategory !== 'All' && <span> {t('blog_in_category')} <strong style={{ color: '#171717' }}>{getCategoryLabel(selectedCategory)}</strong></span>}
              {search && <span> {t('blog_matching')} "<strong style={{ color: '#171717' }}>{search}</strong>"</span>}
            </div>
          </div>

          <div className="vdt-journal-filter-strip">
            <div className="vdt-hero-pills" style={{ padding: 0 }}>
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`vdt-pill-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
              >
                <span>{t('blog_all_articles')}</span>
                <span className="vdt-pill-badge">{livePosts.length}</span>
              </button>

              {blogCategories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                const count = categoryCounts[cat.name] || cat.count || 0;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`vdt-pill-btn ${isActive ? 'active' : ''}`}
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                  >
                    <span>{getCategoryLabel(cat.name)}</span>
                    <span className="vdt-pill-badge">{count}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.84rem', color: '#8E929B', whiteSpace: 'nowrap' }}>
              {t('blog_page_indicator')} {currentPage} {t('blog_of')} {totalPages}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: PREMIUM BLOG CARD GRID (3 cols desktop, 2 tablet, 1 mobile)
            ========================================================================= */}
        {filteredPosts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4.5rem 2rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #EDE5D8',
              maxWidth: '560px',
              margin: '2rem auto 4rem',
            }}
          >
            <Search size={40} style={{ color: '#A67C38', opacity: 0.6, marginBottom: '1.25rem' }} />
            <h3
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.5rem',
                color: '#171717',
                marginBottom: '0.75rem',
              }}
            >
              {t('blog_no_found_title')}
            </h3>
            <p style={{ color: '#62666D', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {t('blog_no_found_desc')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '9999px',
                background: '#A67C38',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              {t('blog_reset_filters')}
            </button>
          </div>
        ) : (
          <div className="vdt-blog-grid">
            {currentPosts.map((post) => (
              <article key={post.slug} className="vdt-card">
                {/* Cover Image Frame */}
                <Link
                  to={`/blog/${post.slug}/`}
                  className="vdt-card-img-wrap"
                  aria-label={post.title}
                >
                  <BlogCoverImage
                    src={post.featuredImage}
                    alt={post.featuredImageAlt || post.title}
                    variant="card"
                    isPoster={post.isPoster}
                  />
                </Link>

                {/* Card Body */}
                <div className="vdt-card-body">
                  <span className="vdt-card-category-pill">
                    {getCategoryLabel(post.primaryCategory)}
                  </span>

                  <h3 className="vdt-card-title">
                    <Link to={`/blog/${post.slug}/`}>
                      {post.title}
                    </Link>
                  </h3>

                  <div className="vdt-card-meta-strip">
                    <span className="vdt-card-meta-item">
                      <Calendar size={13} style={{ color: '#A67C38' }} />
                      <span>{formatDate(post.date)}</span>
                    </span>
                    <span>•</span>
                    <span className="vdt-card-meta-item">
                      <Clock size={13} style={{ color: '#A67C38' }} />
                      <span>{formatReadTime(post.readTime)}</span>
                    </span>
                  </div>

                  <p className="vdt-card-excerpt">
                    {post.excerpt}
                  </p>

                  <div className="vdt-card-footer">
                    <Link to={`/blog/${post.slug}/`} className="vdt-card-link">
                      <span>{t('blog_read_article')}</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* =========================================================================
            SECTION 5: PAGINATION CONTROLS
            ========================================================================= */}
        {totalPages > 1 && (
          <nav className="vdt-pagination-wrap" aria-label="Blog Pagination">
            {/* Previous Page */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className="vdt-page-nav-btn"
              aria-label="Go to previous page"
            >
              <ChevronLeft size={16} />
              <span>{t('blog_prev')}</span>
            </button>

            {/* Smart Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
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
                      <span className="vdt-pagination-ellipsis">...</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`vdt-page-btn ${currentPage === page ? 'active' : ''}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                      aria-label={`Page ${page}`}
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
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className="vdt-page-nav-btn"
              aria-label="Go to next page"
            >
              <span>{t('blog_next')}</span>
              <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
