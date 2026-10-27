import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  icon: () => '📰',
  groups: [
    { name: 'basic', title: '1. Basic Information', default: true },
    { name: 'featuredImage', title: '2. Featured Image' },
    { name: 'content', title: '3. Blog Content' },
    { name: 'seo', title: '4. SEO Metadata' },
    { name: 'advanced', title: '5. Advanced Settings' },
  ],
  fields: [
    /* =========================================================================
       GROUP 1: BASIC INFORMATION
       ========================================================================= */
    defineField({
      name: 'title',
      title: 'Blog Title',
      type: 'string',
      group: 'basic',
      description: 'The main headline of the article',
      validation: (Rule) => Rule.required().min(5).max(150),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      group: 'basic',
      options: {
        source: 'title',
        maxLength: 120,
      },
      description: 'Unique URL path segment (e.g. hallstatt-day-trip-guide)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category Reference',
      type: 'reference',
      group: 'basic',
      to: [{ type: 'blogCategory' }],
      description: 'Select an existing category from the CMS taxonomy',
    }),
    defineField({
      name: 'categoryName',
      title: 'Category Direct Label (Legacy Fallback)',
      type: 'string',
      group: 'basic',
      description: 'Direct category text fallback (e.g., Luxury Travel, Day Trips, Chauffeur)',
    }),
    defineField({
      name: 'excerpt',
      title: 'Summary / Excerpt',
      type: 'text',
      rows: 3,
      group: 'basic',
      description: 'Engaging multiline summary displayed on blog archive cards, search previews, and meta snippets',
      validation: (Rule) => Rule.max(350),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date Published',
      type: 'datetime',
      group: 'basic',
      description: 'Original publication date and time',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'modifiedAt',
      title: 'Date Modified',
      type: 'datetime',
      group: 'basic',
      description: 'Last updated date and time for SEO search engines',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'author',
      title: 'Author Name',
      type: 'string',
      group: 'basic',
      initialValue: 'Vienna Day Trip Editorial Team',
      description: 'Byline author or editorial team credited for this article',
    }),
    defineField({
      name: 'readTime',
      title: 'Estimated Reading Time',
      type: 'string',
      group: 'basic',
      initialValue: '5 min read',
      description: 'Calculated or custom reading duration (e.g., 6 min read)',
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      group: 'basic',
      description: 'Topical tags and keywords associated with this blog post',
    }),

    /* =========================================================================
       GROUP 2: FEATURED IMAGE
       ========================================================================= */
    defineField({
      name: 'coverImage',
      title: 'Featured Image',
      type: 'image',
      group: 'featuredImage',
      options: {
        hotspot: true,
      },
      description: 'Upload high-resolution featured photo with custom crop and focal point, or use existing static URL fallback',
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Essential for accessibility and image SEO ranking',
        },
        {
          name: 'title',
          type: 'string',
          title: 'Image Title Attribute',
          description: 'Hover title tooltip and metadata for the image',
        },
        {
          name: 'imageUrl',
          type: 'string',
          title: 'Static / External Image URL (Fallback)',
          description: 'Preserved static asset path (e.g. /blog-images/filename.webp) or remote CDN URL',
        },
      ],
    }),

    /* =========================================================================
       GROUP 3: BLOG CONTENT (Visual Rich Text + Legacy HTML)
       ========================================================================= */
    defineField({
      name: 'body',
      title: 'Visual Rich Text Editor (Portable Text)',
      type: 'array',
      group: 'content',
      description: '✨ Professional Visual Editor for new content: Headings (H2, H3, H4), formatting, lists, quotes, tables, and media.',
      of: [
        {
          type: 'block',
          title: 'Block',
          styles: [
            { title: 'Normal Paragraph', value: 'normal' },
            { title: 'Heading 2 (H2)', value: 'h2' },
            { title: 'Heading 3 (H3)', value: 'h3' },
            { title: 'Heading 4 (H4)', value: 'h4' },
            { title: 'Quote Block', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet List', value: 'bullet' },
            { title: 'Numbered List', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong / Bold', value: 'strong' },
              { title: 'Emphasis / Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strikethrough', value: 'strike-through' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'External Hyperlink',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                  {
                    title: 'Open in new tab',
                    name: 'blank',
                    type: 'boolean',
                    initialValue: true,
                  },
                ],
              },
              {
                name: 'internalLink',
                type: 'object',
                title: 'Internal Blog Reference',
                fields: [
                  {
                    name: 'reference',
                    type: 'reference',
                    title: 'Reference Article',
                    to: [{ type: 'blogPost' }],
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          title: 'Inline Photo',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              description: 'Required for accessibility and SEO',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Photo Caption',
              description: 'Visible caption displayed underneath image',
            },
          ],
        },
        {
          type: 'table',
          title: 'Data Table',
        },
      ],
    }),
    defineField({
      name: 'content',
      title: 'Legacy Article HTML Content',
      type: 'text',
      rows: 10,
      group: 'content',
      description: '⚠️ LEGACY HTML CONTENT: Preserved for existing migrated articles. When Portable Text above is empty, this HTML renders seamlessly on the public site. For new posts, use the Visual Rich Text Editor.',
    }),

    /* =========================================================================
       GROUP 4: SEO METADATA
       ========================================================================= */
    defineField({
      name: 'seo',
      title: 'SEO Metadata',
      type: 'object',
      group: 'seo',
      description: 'Fine-tune how this article appears in Google, social shares, and search crawlers',
      fields: [
        {
          name: 'metaTitle',
          title: 'SEO Title',
          type: 'string',
          description: 'Custom browser tab & search engine title. If left blank, post title is used.',
        },
        {
          name: 'metaDescription',
          title: 'SEO Description',
          type: 'text',
          rows: 3,
          description: 'Search snippet description (150–160 characters recommended for high CTR).',
        },
        {
          name: 'keywords',
          title: 'SEO Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          options: { layout: 'tags' },
          description: 'Search ranking keywords targeted by this article.',
        },
        {
          name: 'canonicalUrl',
          title: 'Canonical URL',
          type: 'url',
          description: 'Optional custom canonical link. If empty, the default /blog/{slug}/ URL is automatically used.',
        },
        {
          name: 'headScript',
          title: 'Approved Custom Head Script',
          type: 'text',
          rows: 3,
          description: 'Verified tracking / structured JSON-LD script for <head>. Injected only after validation.',
        },
        {
          name: 'bodyScript',
          title: 'Approved Custom Body Script',
          type: 'text',
          rows: 3,
          description: 'Verified custom script tag for <body>. Injected only after validation.',
        },
      ],
    }),

    /* =========================================================================
       GROUP 5: ADVANCED SETTINGS
       ========================================================================= */
    defineField({
      name: 'isPublished',
      title: 'Publication Status',
      type: 'boolean',
      group: 'advanced',
      initialValue: true,
      description: 'Active switch: When disabled, this article is hidden from public listings and direct URL access.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'categoryName',
      media: 'coverImage',
      content: 'content',
      body: 'body',
    },
    prepare({ title, subtitle, media, content, body }) {
      const hasPortableText = Array.isArray(body) && body.length > 0;
      const editorType = hasPortableText ? '✨ Visual Editor' : content ? '📜 Legacy HTML' : 'Draft';
      return {
        title: title || 'Untitled Blog Post',
        subtitle: `${subtitle || 'Uncategorized'} • ${editorType}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Publication Date, Newest',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Title, A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
});
