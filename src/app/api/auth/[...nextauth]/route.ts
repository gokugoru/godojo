import { handlers } from '@/lib/auth/auth';

// NextAuth v5 API Route Handler
// Экспортируем GET и POST handlers из нашей auth конфигурации
export const { GET, POST } = handlers;
