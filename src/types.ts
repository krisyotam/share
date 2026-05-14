export interface ShareMeta {
  /** Page <title> and index link text */
  title: string;
  /** URL slug — must match the filename in shares/ */
  slug: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** Short blurb for the index */
  description: string;
  /** Tags for filtering / future search */
  tags?: readonly string[];
  /** Visibility on the index page */
  audience?: 'public' | 'unlisted';
}
