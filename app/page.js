import { supabase } from '@/utils/supabase';
import HomeClient from './components/HomeClient';

// Tối ưu hiệu năng bằng cache tĩnh 5 phút (ISR)
export const revalidate = 300;

async function getPosts() {
  try {
    const { data: posts, error } = await supabase.rpc('list_public_posts');
    if (error) throw error;
    return posts || [];
  } catch (err) {
    console.error('[Homepage] Lỗi load bài viết:', err);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPosts();

  return <HomeClient initialPosts={posts} />;
}
