// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { CACHE_CONFIG } from '@/lib/constants/config';

interface AdminStats {
  users: {
    total: number;
    active: number;
    new: number;
    admins: number;
    moderators: number;
  };
  content: {
    modules: number;
    publishedModules: number;
    sections: number;
    topics: number;
    publishedTopics: number;
  };
  progress: {
    totalSessions: number;
    completedModules: number;
    completedTopics: number;
    avgTimeSpent: number;
  };
  performance: {
    avgCompletionRate: number;
    popularModules: Array<{
      id: string;
      title: string;
      completions: number;
    }>;
    recentActivity: Array<{
      date: string;
      sessions: number;
      completions: number;
    }>;
  };
  system: {
    lastSync: string | null;
    cacheHitRate: number;
    avgResponseTime: number;
  };
}

const CACHE_KEY = 'admin:stats:dashboard';

/**
 * Generate comprehensive admin statistics
 * PERFORMANCE: Optimized aggregation queries + Redis caching
 * SECURITY: Admin role validation + session verification
 */
const generateAdminStats = async (): Promise<AdminStats> => {
  console.log('📊 Generating fresh admin stats...');
  
  try {
    // Parallel execution для максимальной производительности
    const [
      userStats,
      contentStats,
      progressStats,
      performanceData,
      githubIntegration
    ] = await Promise.all([
      // User Statistics
      prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({
          where: { lastLogin: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        }),
        prisma.user.count({
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({ where: { role: 'MODERATOR' } })
      ]),

      // Content Statistics
      prisma.$transaction([
        prisma.module.count(),
        prisma.module.count({ where: { isPublished: true } }),
        prisma.section.count(),
        prisma.topic.count(),
        prisma.topic.count({ where: { isPublished: true } })
      ]),

      // Progress & Engagement
      prisma.$transaction([
        prisma.userProgress.count(),
        prisma.userProgress.count({ where: { status: 'COMPLETED' } }),
        prisma.userProgress.count({ 
          where: { 
            topicId: { not: null },
            status: 'COMPLETED'
          }
        }),
        prisma.userProgress.aggregate({
          _avg: { timeSpent: true }
        })
      ]),

      // Performance Analytics
      prisma.$transaction([
        // Popular modules query
        prisma.userProgress.groupBy({
          by: ['moduleId'],
          where: { status: 'COMPLETED' },
          _count: { moduleId: true },
          orderBy: { _count: { moduleId: 'desc' } },
          take: 5
        }),
        // Recent activity (last 7 days)
        prisma.$queryRaw`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as sessions,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completions
          FROM user_progress 
          WHERE created_at >= NOW() - INTERVAL '7 days'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        ` as Promise<Array<{ date: Date; sessions: bigint; completions: bigint }>>
      ]),

      // System Health
      prisma.gitHubIntegration.findFirst({
        orderBy: { lastSyncAt: 'desc' }
      })
    ]);

    // Process popular modules data
    const popularModulesData = await Promise.all(
      performanceData[0].map(async (item) => {
        const module = await prisma.module.findUnique({
          where: { id: item.moduleId },
          select: { id: true, titleEn: true }
        });
        return {
          id: item.moduleId,
          title: module?.titleEn || 'Unknown Module',
          completions: item._count.moduleId
        };
      })
    );

    // Process recent activity data
    const recentActivity = (performanceData[1] as any[]).map((day) => ({
      date: day.date.toISOString().split('T')[0],
      sessions: Number(day.sessions),
      completions: Number(day.completions)
    }));

    // Calculate completion rate
    const totalProgressEntries = progressStats[0];
    const completedEntries = progressStats[1];
    const avgCompletionRate = totalProgressEntries > 0 
      ? (completedEntries / totalProgressEntries) * 100 
      : 0;

    const stats: AdminStats = {
      users: {
        total: userStats[0],
        active: userStats[1],
        new: userStats[2],
        admins: userStats[3],
        moderators: userStats[4]
      },
      content: {
        modules: contentStats[0],
        publishedModules: contentStats[1],
        sections: contentStats[2],
        topics: contentStats[3],
        publishedTopics: contentStats[4]
      },
      progress: {
        totalSessions: progressStats[0],
        completedModules: progressStats[1],
        completedTopics: progressStats[2],
        avgTimeSpent: Math.round(progressStats[3]._avg.timeSpent || 0)
      },
      performance: {
        avgCompletionRate: Math.round(avgCompletionRate * 100) / 100,
        popularModules: popularModulesData,
        recentActivity
      },
      system: {
        lastSync: githubIntegration?.lastSyncAt?.toISOString() || null,
        cacheHitRate: 0.85, // TODO: Implement actual cache monitoring
        avgResponseTime: 95 // TODO: Implement actual performance monitoring
      }
    };

    console.log('✅ Admin stats generated successfully');
    return stats;

  } catch (error) {
    console.error('❌ Error generating admin stats:', error);
    throw new Error('Failed to generate admin statistics');
  }
};

/**
 * GET /api/admin/stats
 * Returns comprehensive admin dashboard statistics
 * 
 * Features:
 * - Redis caching (15 min TTL)
 * - Admin role validation
 * - Optimized database queries
 * - Real-time data aggregation
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validate admin session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log(`🔍 Admin stats request from: ${session.user.email}`);

    // Try cache first
    try {
      const cachedStats = await redis.get(CACHE_KEY);
      if (cachedStats) {
        console.log('⚡ Serving admin stats from cache');
        return NextResponse.json({
          success: true,
          data: JSON.parse(cachedStats),
          cached: true,
          responseTime: Date.now() - startTime
        });
      }
    } catch (cacheError) {
      console.warn('⚠️ Redis cache miss for admin stats:', cacheError);
    }

    // Generate fresh stats
    const stats = await generateAdminStats();
    
    // Cache the results
    try {
      await redis.setex(
        CACHE_KEY, 
        CACHE_CONFIG.ADMIN_STATS_TTL, 
        JSON.stringify(stats)
      );
      console.log('💾 Admin stats cached successfully');
    } catch (cacheError) {
      console.warn('⚠️ Failed to cache admin stats:', cacheError);
    }

    const responseTime = Date.now() - startTime;
    console.log(`📊 Admin stats generated in ${responseTime}ms`);

    return NextResponse.json({
      success: true,
      data: stats,
      cached: false,
      responseTime
    });

  } catch (error) {
    console.error('❌ Admin stats API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/stats/refresh
 * Force refresh admin statistics (bypass cache)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log(`🔄 Force refresh admin stats by: ${session.user.email}`);

    // Clear cache
    try {
      await redis.del(CACHE_KEY);
      console.log('🗑️ Admin stats cache cleared');
    } catch (cacheError) {
      console.warn('⚠️ Failed to clear cache:', cacheError);
    }

    // Generate fresh stats
    const stats = await generateAdminStats();
    
    // Cache new results
    try {
      await redis.setex(
        CACHE_KEY, 
        CACHE_CONFIG.ADMIN_STATS_TTL, 
        JSON.stringify(stats)
      );
    } catch (cacheError) {
      console.warn('⚠️ Failed to cache refreshed stats:', cacheError);
    }

    return NextResponse.json({
      success: true,
      data: stats,
      refreshed: true
    });

  } catch (error) {
    console.error('❌ Admin stats refresh error:', error);
    
    return NextResponse.json(
      { error: 'Failed to refresh statistics' },
      { status: 500 }
    );
  }
}
