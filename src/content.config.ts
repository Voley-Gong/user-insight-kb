import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/knowledge' }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    module: z.string(),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['基础', '进阶', '高级']).default('基础'),
    prerequisites: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    status: z.enum(['draft', 'review', 'published']).default('draft'),
    author: z.string().default('unknown'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD（字符串，如 "2024-01-15"）').transform((val) => new Date(val)),
  }),
});

export const collections = { knowledge };
