import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'aboutContent',
  title: 'About Us Content',
  type: 'document',
  icon: () => '📖',
  fields: [
    defineField({
      name: 'pageTitle',
      title: 'Hero Heading',
      type: 'string',
      initialValue: 'Redefining Private Travel in Central Europe',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 3,
      initialValue: 'Founded on discretion, punctuality, and Austrian hospitality, Vienna Day Trip delivers an unrivaled chauffeur experience.',
    }),
    defineField({
      name: 'storyHeadline',
      title: 'Our Heritage / Story Headline',
      type: 'string',
      initialValue: 'A Tradition of Imperial Hospitality, Modernized',
    }),
    defineField({
      name: 'storyBody',
      title: 'Our Story Body',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'stats',
      title: 'Company Key Metrics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', type: 'string', title: 'Value / Stat (e.g., 100%, 15k+)' },
            { name: 'label', type: 'string', title: 'Stat Label' },
            { name: 'description', type: 'string', title: 'Brief Detail' },
          ],
        },
      ],
    }),
    defineField({
      name: 'standards',
      title: 'Service Standards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Standard Title' },
            { name: 'description', type: 'text', title: 'Standard Description', rows: 2 },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'pageTitle',
      subtitle: 'storyHeadline',
    },
  },
});
