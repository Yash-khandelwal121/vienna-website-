import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'mediaAsset',
  title: 'Media Asset',
  type: 'document',
  icon: () => '🖼️',
  fields: [
    defineField({
      name: 'title',
      title: 'Asset Title / Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Fleet Vehicles', value: 'fleet' },
          { title: 'Services & Chauffeur', value: 'services' },
          { title: 'Day Trips & Tours', value: 'tours' },
          { title: 'Blog Editorial', value: 'blog' },
          { title: 'Brand & Logos', value: 'branding' },
          { title: 'General Assets', value: 'general' },
        ],
      },
      initialValue: 'general',
    }),
    defineField({
      name: 'image',
      title: 'Image File',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'altText',
      title: 'Alt Text (SEO & Accessibility)',
      type: 'string',
    }),
    defineField({
      name: 'caption',
      title: 'Caption / Credit',
      type: 'string',
    }),
    defineField({
      name: 'uploadedAt',
      title: 'Upload Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'image',
    },
  },
});
