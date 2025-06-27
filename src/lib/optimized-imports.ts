// src/lib/optimized-imports.ts
// Оптимизированные импорты для уменьшения bundle size

// ❌ Плохо - импортирует всю библиотеку
// import _ from 'lodash';
// import * as dateFns from 'date-fns';

// ✅ Хорошо - импортирует только нужные функции
export { debounce, throttle, groupBy, orderBy } from 'lodash';
export { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';

// Для Lucide React - используем tree shaking
export {
	User,
	Settings,
	LogOut,
	Star,
	Github,
	Mail,
	Eye,
	EyeOff,
	ChevronDown,
	ChevronRight,
	Plus,
	Search,
	Filter,
	MoreHorizontal,
} from 'lucide-react';

// Для Recharts - только нужные компоненты
export {
	LineChart,
	BarChart,
	PieChart,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';

// Динамические импорты для тяжелых компонентов
export const importHeavyComponents = {
	ReactQuery: () => import('@tanstack/react-query'),
	ReactQueryDevtools: () => import('@tanstack/react-query-devtools'),
	MarkdownEditor: () => import('@uiw/react-md-editor'),
	MarkdownPreview: () => import('@uiw/react-markdown-preview'),
};
