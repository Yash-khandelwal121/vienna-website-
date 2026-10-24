import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'dayTrip',
  title: 'Day Trip Destination',
  type: 'document',
  icon: () => '🏰',
  fields: [
    defineField({
      name: 'title',
      title: 'Tour / Trip Title',
      type: 'string',
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
      name: 'destination',
      title: 'Destination Region / City',
      type: 'string',
    }),
    defineField({
      name: 'duration',
      title: 'Estimated Duration',
      type: 'string',
      initialValue: '8 - 10 Hours',
    }),
    defineField({
      name: 'distance',
      title: 'Distance from Vienna',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: 'Tour Price (€)',
      type: 'number',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt Text' },
        { name: 'imageUrl', type: 'string', title: 'Static Asset Path (Fallback)' },
      ],
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'itinerary',
      title: 'Itinerary Timeline',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'time', type: 'string', title: 'Time / Stage' },
            { name: 'title', type: 'string', title: 'Headline' },
            { name: 'description', type: 'text', title: 'Description', rows: 2 },
          ],
        },
      ],
    }),
    defineField({
      name: 'included',
      title: 'What Is Included',
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
      title: 'Active Tour',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'duration',
      media: 'heroImage',
    },
  },
});
