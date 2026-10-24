import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'chauffeurService',
  title: 'Chauffeur Service',
  type: 'document',
  icon: () => '🛎️',
  fields: [
    defineField({
      name: 'title',
      title: 'Service Title',
      type: 'string',
      description: 'e.g., Airport Transfers, Hourly Chauffeur, Secure Transportation',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle / Tagline',
      type: 'string',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'fullDescription',
      title: 'Full Service Overview',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero / Feature Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt Text' },
        { name: 'imageUrl', type: 'string', title: 'Static Asset Path (Fallback)' },
      ],
    }),
    defineField({
      name: 'icon',
      title: 'Icon Name (Lucide / Visual ID)',
      type: 'string',
      initialValue: 'Plane',
    }),
    defineField({
      name: 'startingPrice',
      title: 'Starting Price (€)',
      type: 'number',
    }),
    defineField({
      name: 'priceUnit',
      title: 'Price Unit',
      type: 'string',
      initialValue: 'from €85 per transfer',
    }),
    defineField({
      name: 'highlights',
      title: 'Key Highlights',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'sortOrder',
      title: 'Display Order',
      type: 'number',
      initialValue: 1,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'startingPrice',
      media: 'heroImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `Starting from €${subtitle}` : '',
        media,
      };
    },
  },
});
