#!/bin/bash

# Скрипт для сбора кода проекта Go Dojo
echo "🚀 Собираем код проекта Go Dojo..."

OUTPUT_FILE="project_code_$(date +%Y%m%d_%H%M%S).md"

echo "# Go Dojo - Project Code Collection" > $OUTPUT_FILE
echo "Generated on: $(date)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Функция для добавления файла в отчет
add_file() {
    local file_path=$1
    if [ -f "$file_path" ]; then
        echo "## $file_path" >> $OUTPUT_FILE
        echo "\`\`\`typescript" >> $OUTPUT_FILE
        cat "$file_path" >> $OUTPUT_FILE
        echo "" >> $OUTPUT_FILE
        echo "\`\`\`" >> $OUTPUT_FILE
        echo "" >> $OUTPUT_FILE
        echo "✅ Added: $file_path"
    else
        echo "⚠️  Not found: $file_path"
    fi
}

echo "📁 Collecting core files..."

# Root layout и конфиги
add_file "src/app/[locale]/layout.tsx"
add_file "src/middleware.ts"
add_file "next.config.ts"
add_file "tailwind.config.ts"

echo "🔧 Collecting configuration..."

# i18n и auth
add_file "src/i18n/routing.ts"
add_file "src/lib/auth/auth.ts"
add_file "src/lib/auth/auth.config.ts"

echo "📝 Collecting database..."

# Prisma
add_file "prisma/schema.prisma"
add_file "src/lib/prisma.ts"

echo "🎨 Collecting components..."

# Основные компоненты
add_file "src/components/header.tsx"
add_file "src/components/modals/auth-modal.tsx"
add_file "src/components/modules/modules-home.tsx"

# UI компоненты
add_file "src/components/ui/button.tsx"
add_file "src/components/ui/input.tsx"
add_file "src/components/ui/tabs.tsx"

echo "🔌 Collecting providers..."

# Providers
add_file "src/components/providers/query-provider.tsx"
add_file "src/components/providers/session-provider.tsx"

echo "🌐 Collecting internationalization..."

# Переводы
add_file "messages/en.json"
add_file "messages/ru.json"

echo "📊 Collecting types..."

# Types
add_file "src/types/auth.ts"
add_file "src/types/modules.ts"

echo "⚙️ Collecting actions..."

# Server actions
find src/actions -name "*.ts" | while read file; do
    add_file "$file"
done

echo "🛣️ Collecting API routes..."

# API routes
find src/app/api -name "*.ts" | while read file; do
    add_file "$file"
done

echo "📄 Collecting pages..."

# Pages
find src/app -name "page.tsx" | while read file; do
    add_file "$file"
done

echo "🎯 Collecting constants..."

# Constants (если есть)
add_file "src/lib/constants/config.ts"
add_file "src/lib/constants/routes.ts"

echo "📦 Collecting package files..."

# Package info
add_file "package.json"
add_file ".env.example"

echo ""
echo "✨ Код собран в файл: $OUTPUT_FILE"
echo "📊 Статистика:"
wc -l $OUTPUT_FILE | awk '{print "Всего строк:", $1}'
echo "📁 Размер файла: $(du -h $OUTPUT_FILE | cut -f1)"

# Создаем краткую сводку
echo ""
echo "## Project Structure Summary" >> $OUTPUT_FILE
echo "\`\`\`" >> $OUTPUT_FILE
find src -type f -name "*.tsx" -o -name "*.ts" | head -20 >> $OUTPUT_FILE
echo "..." >> $OUTPUT_FILE
echo "\`\`\`" >> $OUTPUT_FILE

echo ""
echo "🎉 Готово! Файл создан: $OUTPUT_FILE"