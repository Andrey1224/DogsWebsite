import { defineField, defineType } from 'sanity';

export const tipBoxType = defineType({
  name: 'tipBox',
  title: 'Совет / Подсказка',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      initialValue: 'Совет ветеринара',
    }),
    defineField({
      name: 'content',
      title: 'Текст',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'content' },
  },
});
