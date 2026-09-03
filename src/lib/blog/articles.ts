export interface BlogArticle {
  slug: string;
  image: string;
  date: string;
}

export const staticArticles: BlogArticle[] = [
  {
    slug: 'buying-first-home',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=600',
    date: 'Oct 15, 2024',
  },
  {
    slug: 'understanding-land-registration',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600',
    date: 'Nov 02, 2024',
  },
  {
    slug: 'renting-vs-buying',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600',
    date: 'Dec 10, 2024',
  },
  {
    slug: 'plot-buying-guide',
    image: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=600',
    date: 'Jan 22, 2025',
  }
];
