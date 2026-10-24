import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'luxuryFleet',
  title: 'Luxury Fleet',
  type: 'document',
  icon: () => '🚘',
  fields: [
    defineField({
      name: 'name',
      title: 'Vehicle Name',
      type: 'string',
      description: 'e.g., Mercedes-Benz S-Class',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'model',
      title: 'Model / Specification',
      type: 'string',
      description: 'e.g., W223 Long Wheelbase / First Class',
    }),
    defineField({
      name: 'category',
      title: 'Class / Category',
      type: 'string',
      options: {
        list: [
          { title: 'First Class Sedan', value: 'First Class' },
          { title: 'Business Class Sedan', value: 'Business Class' },
          { title: 'Business Van / MPV', value: 'Business Van' },
          { title: 'VIP Sprinter', value: 'VIP Sprinter' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'e.g., The Ultimate Statement in European Chauffeur Luxury',
    }),
    defineField({
      name: 'image',
      title: 'Vehicle Cutout / High-Res Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
        },
        {
          name: 'imageUrl',
          type: 'string',
          title: 'Local / Static Asset Path (Fallback)',
        },
      ],
    }),
    defineField({
      name: 'capacityPassengers',
      title: 'Max Passengers',
      type: 'number',
      initialValue: 3,
    }),
    defineField({
      name: 'capacityLuggage',
      title: 'Luggage Capacity (Pieces)',
      type: 'number',
      initialValue: 2,
    }),
    defineField({
      name: 'features',
      title: 'Key Luxury Amenities & Features',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'hourlyRate',
      title: 'Hourly Rate (€)',
      type: 'number',
    }),
    defineField({
      name: 'dayRate',
      title: 'Full Day Rate (€)',
      type: 'number',
    }),
    defineField({
      name: 'isAvailable',
      title: 'Active in Fleet',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Display Order',
      type: 'number',
      initialValue: 1,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
    },
  },
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],
});
