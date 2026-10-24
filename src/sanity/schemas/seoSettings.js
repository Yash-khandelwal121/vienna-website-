import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'seoSettings',
  title: 'SEO Settings',
  type: 'document',
  icon: () => '🔍',
  fields: [
    defineField({
      name: 'pageRoute',
      title: 'Page Route / Path',
      type: 'string',
      description: 'e.g., / (Home), /about-vienna-day-trip, /our-services, /luxury-fleet, /day-trips, /blog',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
    }),
    defineField({
      name: 'ogImage',
      title: 'OpenGraph Share Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'keywords',
      title: 'Target Keywords',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'noIndex',
      title: 'Robots NoIndex',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'pageRoute',
      subtitle: 'metaTitle',
    },
  },
});
