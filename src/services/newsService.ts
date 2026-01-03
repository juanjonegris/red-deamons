import type { NewsAPIResponse, Article } from "../types/NewsApi";

const API_KEY = "000c8de9c86848278d35b4ed286592a9";
const BASE_URL = "https://newsapi.org/v2/everything";

export const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .normalize("NFD") // Normalize specialized characters
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start
        .replace(/-+$/, ""); // Trim - from end
};

export async function fetchBasketballNews(): Promise<Article[]> {
    const query = "baloncesto OR basketball"; // Broaden search
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&sortBy=popularity&pageSize=20&language=es&apiKey=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching news: ${response.statusText}`);
        }
        const data: NewsAPIResponse = await response.json();

        if (data.status !== "ok") {
            console.error("NewsAPI Error:", data);
            return [];
        }

        // Add slug to articles
        return data.articles.map((article, index) => ({
            ...article,
            slug: `${slugify(article.title)}-${index}`, // Ensure unique slug
        })).filter(article => article.title !== "[Removed]"); // Filter removed articles
    } catch (error) {
        console.error("Failed to fetch news:", error);
        return [];
    }
}
