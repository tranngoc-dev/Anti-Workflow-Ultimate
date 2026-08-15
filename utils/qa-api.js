import { supabase } from './supabase';

/**
 * Q&A System API Helper for Supabase (using thread_comments and thread_comment_likes)
 */

// 1. Fetch threads (with optional realtime search query)
export async function getThreads(searchQuery = '') {
  try {
    let query = supabase
      .from('threads')
      .select(`
        *,
        author:profiles(id, display_name, avatar_url, rank, gold_balance),
        thread_comments(id, is_best_answer)
      `)
      .order('created_at', { ascending: false });

    if (searchQuery.trim() !== '') {
      // Search by title or content
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Format thread data to count comments and check if resolved
    const formatted = (data || []).map(thread => {
      const comments = thread.thread_comments || [];
      return {
        ...thread,
        comments_count: comments.length,
        is_resolved: comments.some(c => c.is_best_answer)
      };
    });

    // Sắp xếp: Bài viết có nhiều bình luận nhất xếp trên cùng, nếu bằng nhau bài mới hơn xếp trước
    return formatted.sort((a, b) => {
      if (b.comments_count !== a.comments_count) {
        return b.comments_count - a.comments_count;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  } catch (err) {
    console.error('[QA-API] getThreads error:', err);
    return [];
  }
}

// 2. Fetch a single thread by ID
export async function getThreadById(id) {
  try {
    const { data, error } = await supabase
      .from('threads')
      .select(`
        *,
        author:profiles(id, display_name, avatar_url, rank, gold_balance)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error(`[QA-API] getThreadById (${id}) error:`, err);
    return null;
  }
}

// 3. Fetch comments for a thread with nested replies
export async function getComments(threadId, currentUserId = null) {
  try {
    const { data, error } = await supabase
      .from('thread_comments')
      .select(`
        *,
        author:profiles!thread_comments_author_id_fkey(id, display_name, avatar_url, rank, gold_balance)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    let enrichedData = (data || []).map(c => ({ ...c, is_liked: false }));

    // If current user is logged in, check which comments they liked
    if (currentUserId && data && data.length > 0) {
      const commentIds = data.map(c => c.id);
      const { data: likedData, error: likedError } = await supabase
        .from('thread_comment_likes')
        .select('comment_id')
        .eq('user_id', currentUserId)
        .in('comment_id', commentIds);

      if (!likedError && likedData) {
        const likedSet = new Set(likedData.map(item => item.comment_id));
        enrichedData = enrichedData.map(c => ({
          ...c,
          is_liked: likedSet.has(c.id)
        }));
      }
    }

    // Organize into nested structure (Root comments + replies)
    const rootComments = [];
    const commentMap = {};

    enrichedData.forEach(item => {
      item.replies = [];
      commentMap[item.id] = item;
    });

    enrichedData.forEach(item => {
      if (item.parent_id && commentMap[item.parent_id]) {
        commentMap[item.parent_id].replies.push(item);
      } else {
        rootComments.push(item);
      }
    });

    // Sort root comments: Best Answer first, then created_at asc
    rootComments.sort((a, b) => {
      if (b.is_best_answer !== a.is_best_answer) {
        return (b.is_best_answer ? 1 : 0) - (a.is_best_answer ? 1 : 0);
      }
      return new Date(a.created_at) - new Date(b.created_at);
    });

    // Sort replies inside each root comment: created_at asc
    rootComments.forEach(root => {
      root.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });

    return rootComments;
  } catch (err) {
    console.error(`[QA-API] getComments for thread ${threadId} error:`, err);
    return [];
  }
}

// 4. Create a new thread
export async function createThread(title, content, authorId) {
  try {
    const { data, error } = await supabase
      .from('threads')
      .insert([{ title, content, author_id: authorId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[QA-API] createThread error:', err);
    throw err;
  }
}

// 5. Create a comment (supports top-level and nested reply)
export async function createComment(threadId, content, authorId, parentId = null) {
  try {
    // Check if user is comment banned
    const { data: profile } = await supabase
      .from('profiles')
      .select('comment_banned_until')
      .eq('id', authorId)
      .single();

    if (profile?.comment_banned_until && new Date(profile.comment_banned_until) > new Date()) {
      const banDate = new Date(profile.comment_banned_until).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      throw new Error(`Tài khoản của bạn đang bị tạm khóa tính năng bình luận đến ${banDate} do vi phạm quy định.`);
    }

    const { data, error } = await supabase
      .from('thread_comments')
      .insert([{ 
        thread_id: threadId, 
        author_id: authorId, 
        content,
        parent_id: parentId || null 
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[QA-API] createComment error:', err);
    throw err;
  }
}

// 6. Like a comment (adds 1 Gold via database trigger)
export async function likeComment(commentId, userId) {
  try {
    const { error } = await supabase
      .from('thread_comment_likes')
      .insert([{ comment_id: commentId, user_id: userId }]);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[QA-API] likeComment error:', err);
    throw err;
  }
}

// 7. Unlike a comment (subtracts 1 Gold via database trigger)
export async function unlikeComment(commentId, userId) {
  try {
    const { error } = await supabase
      .from('thread_comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[QA-API] unlikeComment error:', err);
    throw err;
  }
}

// 8. Toggle Best Answer (adds/revokes 10 Gold and resets other comments via trigger)
export async function setBestAnswer(commentId, threadId, isCurrentlyBest) {
  try {
    const { data, error } = await supabase
      .from('thread_comments')
      .update({ is_best_answer: !isCurrentlyBest })
      .eq('id', commentId)
      .eq('thread_id', threadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[QA-API] setBestAnswer error:', err);
    throw err;
  }
}

// 9. Fetch profile detail
export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error(`[QA-API] getProfile (${userId}) error:`, err);
    return null;
  }
}

// 10. Fetch user threads
export async function getUserThreads(userId) {
  try {
    const { data, error } = await supabase
      .from('threads')
      .select(`
        *,
        thread_comments(id, is_best_answer)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const formatted = (data || []).map(thread => {
      const comments = thread.thread_comments || [];
      return {
        ...thread,
        comments_count: comments.length,
        is_resolved: comments.some(c => c.is_best_answer)
      };
    });

    // Sắp xếp: Nhiều bình luận nhất lên trên cùng
    return formatted.sort((a, b) => {
      if (b.comments_count !== a.comments_count) {
        return b.comments_count - a.comments_count;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  } catch (err) {
    console.error(`[QA-API] getUserThreads (${userId}) error:`, err);
    return [];
  }
}

// 11. Fetch top users by Gold balance (Leaderboard)
export async function getTopUsers(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('gold_balance', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[QA-API] getTopUsers error:', err);
    return [];
  }
}

// 12. Rank metadata & badge image maps
export const RANK_BADGES = {
  'Kim Ngư': '/images/badges/01-kim-ngu.png',
  'Linh Long': '/images/badges/02-linh-long.png',
  'Đế Long': '/images/badges/03-de-long.png',
  'Hỏa Long': '/images/badges/04-hoa-long.png',
  'Thiên Long': '/images/badges/05-thien-long.png'
};

export const RANK_COLORS = {
  'Kim Ngư': '#4b5563',      // Slate Gray
  'Linh Long': '#0f766e',     // Teal
  'Đế Long': '#d97706',      // Gold/Amber
  'Hỏa Long': '#ef4444',      // Red
  'Thiên Long': '#7c3aed'     // Purple
};

// 13. Update a thread comment
export async function updateComment(commentId, content) {
  try {
    const { data, error } = await supabase
      .from('thread_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[QA-API] updateComment error:', err);
    throw err;
  }
}

// 14. Delete a thread comment (author or admin)
export async function deleteComment(commentId) {
  try {
    const { error } = await supabase
      .from('thread_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[QA-API] deleteComment error:', err);
    throw err;
  }
}

// 15. Delete a thread (author or admin)
export async function deleteThread(threadId) {
  try {
    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', threadId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[QA-API] deleteThread error:', err);
    throw err;
  }
}

// 16. Admin update user rank and gold
export async function adminUpdateUserRank(userId, newRank, newGold = null) {
  try {
    const updateData = { 
      rank: newRank,
      updated_at: new Date().toISOString()
    };
    if (newGold !== null && !isNaN(newGold)) {
      updateData.gold_balance = parseInt(newGold, 10);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[QA-API] adminUpdateUserRank error:', err);
    throw err;
  }
}

// 17. Admin ban user from commenting (default 24 hours)
export async function adminBanUserComments(userId, hours = 24) {
  try {
    const banUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        comment_banned_until: banUntil,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[QA-API] adminBanUserComments error:', err);
    throw err;
  }
}

// 18. Admin unban user from commenting
export async function adminUnbanUserComments(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        comment_banned_until: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[QA-API] adminUnbanUserComments error:', err);
    throw err;
  }
}

// 19. Format compact date/time for mobile-friendly responsive display
export function formatCompactDate(dateStr) {
  if (!dateStr) return '';
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin}p trước`;
    if (diffHour < 24) return `${diffHour}h trước`;
    if (diffDay === 1) return 'Hôm qua';
    if (diffDay < 7) return `${diffDay} ngày trước`;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    if (date.getFullYear() === now.getFullYear()) {
      return `${day}/${month}`;
    }
    const yearShort = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${yearShort}`;
  } catch (err) {
    return dateStr;
  }
}


