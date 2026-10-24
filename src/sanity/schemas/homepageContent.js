import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'homepageContent',
  title: 'Homepage Content',
  type: 'document',
  icon: () => '🏠',
  fields: [
    defineField({
      name: 'heroBadge',
      title: 'Hero Gold Pill / Badge',
      type: 'string',
      initialValue: 'AUSTRIA’S PREMIER PRIVATE CHAUFFEUR',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Main Headline',
      type: 'string',
      initialValue: 'Bespoke Chauffeur Excellence Across Austria & Central Europe',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 3,
      initialValue: 'First-class Mercedes-Benz fleet, English-speaking certified chauffeurs, and effortless door-to-door luxury travel.',
    }),
    defineField({
      name: 'excellenceMetrics',
      title: 'Excellence Stats & Badges',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', type: 'string', title: 'Value / Number (e.g., 5.0★, 100%)' },
            { name: 'label', type: 'string', title: 'Metric Label' },
          ],
        },
      ],
    }),
    defineField({
      name: 'aboutSectionTitle',
      title: 'About Section Headline',
      type: 'string',
      initialValue: 'The Vienna Day Trip Standard',
    }),
    defineField({
      name: 'aboutSectionDescription',
      title: 'About Section Text',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'vipConciergeWhatsApp',
      title: 'VIP Concierge WhatsApp Phone',
      type: 'string',
      initialValue: '+436767707378',
    }),
    defineField({
      name: 'vipConciergePhone',
      title: 'VIP Concierge Direct Call',
      type: 'string',
      initialValue: '+43 676 770 7378',
    }),
  ],
  preview: {
    select: {
      title: 'heroTitle',
      subtitle: 'heroBadge',
    },
  },
});
