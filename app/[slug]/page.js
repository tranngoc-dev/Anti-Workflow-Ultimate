import { supabase } from '@/utils/supabase';
import PostClient from './PostClient';
import { notFound } from 'next/navigation';

export const revalidate = 300;

async function getPost(slug) {
  try {
    // Gọi RPC get_public_post để lấy thông tin công khai của bài viết (không truyền mật khẩu ban đầu)
    const { data, error } = await supabase.rpc('get_public_post', {
      p_slug: slug,
      p_password: null,
    });

    if (error) throw error;
    const post = Array.isArray(data) ? data[0] : data;
    return post || null;
  } catch (err) {
    console.error('[PostPage] Lỗi lấy chi tiết bài viết:', err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết — Tủ lạnh',
      description: 'Bài viết không tồn tại hoặc đã bị xóa.',
    };
  }

  return {
    title: `${post.title} — Tủ lạnh`,
    description: post.excerpt || 'Đọc bài viết chi tiết tại Tủ lạnh.',
    openGraph: {
      title: `${post.title} — Tủ lạnh`,
      description: post.excerpt || 'Đọc bài viết chi tiết tại Tủ lạnh.',
      type: 'article',
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
  };
}

export default async function PostPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <PostClient initialPost={post} slug={slug} />;
}
