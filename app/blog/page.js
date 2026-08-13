import { supabase } from '@/utils/supabase';
import HomeClient from '../components/HomeClient';

// Refresh page data every 5 minutes (ISR)
export const revalidate = 300;

async function getPosts() {
  try {
    const { data: posts, error } = await supabase.rpc('list_public_posts');
    if (error) throw error;
    return posts || [];
  } catch (err) {
    console.error('[BlogPage] Lỗi load bài viết:', err);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return <HomeClient initialPosts={posts} />;
}
