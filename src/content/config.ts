import { defineCollection, z } from 'astro:content';

const noticias = defineCollection({
    schema: z.object({
        title: z.string(),
        intro: z.string(),
        image: z.object({
            src: z.string(),
            alt: z.string(),
        }),
        publishDate: z.string().transform((str) => new Date(str)),
    }),
});

export const collections = {
    noticias,
};
