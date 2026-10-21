import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, Search, ArrowRight, BookOpen, MessageSquare } from 'lucide-react';
import { blogPosts } from '../data/pages';
import { siteConfig } from '../data/site';

export default function Blog() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { name: "All", count: 143 },
    { name: "Our Blog", count: 56 },
    { name: "Chauffeur", count: 40 },
    { name: "Wachau Valley", count: 12 },
    { name: "Salzburg & Alps", count: 8 },
    { name: "Car Rent", count: 8 },
    { name: "General", count: 11 }
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' ||
      post.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ position: 'relative' }}>
      {/* Blog Hero */}
      <section
        style={{
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          paddingTop: '8rem',
          paddingBottom: '3.5rem',
          backgroundColor: 'var(--bg-main)',
          overflow: 'hidden'
        }}
      >
        <div className="container-wide" style={{ position: 'relative', zIndex: 10 }}>
          <div className="eyebrow">VIENNA & CENTRAL EUROPE TRAVEL JOURNAL</div>
          <h1 className="heading-xl" style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            INSIDER TRAVEL GUIDES & NOTES.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '680px', lineHeight: '1.65' }}>
            Expert chauffeur advice, scenic route breakdowns, and cultural guides across Austria and Central Europe.
          </p>
        </div>
      </section>

      {/* Main Blog Content Area */}
      <section className="section section-dark">
        <div className="container-wide">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '3.5rem',
              alignItems: 'flex-start'
            }}
          >
            {/* Left 8 Cols: Articles Feed */}
            <div style={{ gridColumn: 'span 8' }} className="blog-posts-col">
              {/* Search Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.85rem 1.4rem',
                  marginBottom: '2.5rem'
                }}
              >
                <Search size={18} style={{ color: 'var(--accent)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles by title, destination, or keyword..."
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Articles Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {filteredPosts.map((post) => (
                  <article
                    key={post.slug}
                    className="card-strada"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '2rem',
                      alignItems: 'center',
                      padding: '1.75rem'
                    }}
                  >
                    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '240px', position: 'relative' }}>
                      <img
                        src={post.image}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                        <span className="pill-badge">{post.category}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={13} style={{ color: 'var(--accent)' }} /> {post.date}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={13} style={{ color: 'var(--accent)' }} /> {post.readTime}
                          </span>
                        </div>

                        <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
                          {post.title}
                        </h2>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
                          {post.excerpt}
                        </p>
                      </div>

                      <div>
                        <a
                          href={`${siteConfig.whatsappUrl}&text=Hello!%20I%20read%20your%20article%20'${encodeURIComponent(post.title)}'%20and%20would%20like%20to%20plan%20this%20trip.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <span>PLAN THIS ROUTE WITH US</span>
                          <ArrowRight size={14} />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}

                {filteredPosts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No articles matched your search query.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 Cols: Sidebar */}
            <div style={{ gridColumn: 'span 4' }} className="blog-sidebar-col">
              {/* About Author / Service Box */}
              <div className="card-strada" style={{ marginBottom: '2rem' }}>
                <div className="eyebrow">VIENNA DAY TRIP DISPATCH</div>
                <h3 className="heading-md" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  RELIABLE CHAUFFEUR TRAVEL
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                  We address our offer to all who want to travel in comfortable conditions. We have access to over 120 top-class Mercedes vehicles, so our customers can be assured of comfort, safety, and fixed pricing.
                </p>
                <Link to="/tour-pricing/" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <span>BOOK YOUR RIDE</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Categories Box */}
              <div className="card-strada" style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  CATEGORIES
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.5rem 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: selectedCategory === cat.name ? 'var(--accent)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontWeight: selectedCategory === cat.name ? 700 : 500 }}>{cat.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({cat.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp Quick Link */}
              <div className="card-strada" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--accent-border)' }}>
                <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  NEED CUSTOM RECOMMENDATIONS?
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  Speak directly with Harmeet Singh Cheema and our local dispatch team for recommendations on secret view stops and local wineries.
                </p>
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <MessageSquare size={15} />
                  <span>ASK VIA WHATSAPP</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .blog-posts-col { grid-column: span 12 !important; }
          .blog-sidebar-col { grid-column: span 12 !important; }
        }
      `}</style>
    </div>
  );
}
