'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Topic {
	id: string;
	title: string;
}

interface Section {
	title: string;
	topics: Topic[];
}

interface Module {
	id: number;
	title: string;
	description: string;
	duration: string;
	progress: number;
	status?: string;
	sections: Section[];
}

const allModulesData: Module[] = [
	{
		id: 1,
		title: 'Go Fundamentals',
		description:
			'Здесь вы можете изучить Go, начиная с основ, включающий в себя много тонкостей и фишек Go runtime и GMP модели.',
		duration: '5 недель',
		progress: 75,
		status: 'FAANG Focus',
		sections: [
			{
				title: 'Go Setup & Tooling (1 неделя)',
				topics: [
					{
						id: '1.1.1',
						title: 'Go installation: binary, source, version management',
					},
					{ id: '1.1.2', title: 'GOPATH vs Go modules history' },
					{ id: '1.1.3', title: 'go command: build, run, install, clean, env' },
					{ id: '1.1.4', title: 'go fmt: code formatting standards' },
					{ id: '1.1.5', title: 'go vet: static analysis, common mistakes' },
					{ id: '1.1.6', title: 'go mod: init, tidy, download, vendor' },
					{ id: '1.1.7', title: 'go doc: documentation generation' },
					{ id: '1.1.8', title: 'go test: testing commands, flags' },
					{ id: '1.1.9', title: 'Cross compilation: GOOS, GOARCH' },
					{ id: '1.1.10', title: 'Build tags and conditional compilation' },
				],
			},
			{
				title: 'Language Core (2 недели)',
				topics: [
					{
						id: '1.2.1',
						title: 'Go philosophy: simplicity, readability, performance',
					},
					{ id: '1.2.2', title: 'Types, variables, constants, zero values' },
					{
						id: '1.2.3',
						title: 'Functions: parameters, returns, variadic, closures',
					},
					{ id: '1.2.4', title: 'Control structures: if, for, switch, defer' },
					{ id: '1.2.5', title: 'Structs, methods, embedded types' },
					{
						id: '1.2.6',
						title: 'Pointers: when to use, pass by value vs reference',
					},
					{ id: '1.2.7', title: 'Arrays and slices: internals, performance' },
					{
						id: '1.2.8',
						title: 'Maps: implementation, performance characteristics',
					},
					{
						id: '1.2.9',
						title: 'Interfaces: implicit implementation, empty interface',
					},
					{
						id: '1.2.10',
						title: 'Generics (Go 1.18+): type parameters, constraints',
					},
					{ id: '1.2.11', title: 'Type sets and interfaces: comparable, any' },
					{
						id: '1.2.12',
						title: 'Generic functions and types: implementation',
					},
					{ id: '1.2.13', title: 'Type inference: explicit vs implicit' },
					{
						id: '1.2.14',
						title: 'Constraints package: ordered, signed, unsigned',
					},
					{
						id: '1.2.15',
						title: 'Embedding: struct и interface embedding patterns',
					},
					{
						id: '1.2.16',
						title: 'Type assertions: performance, best practices',
					},
					{ id: '1.2.17', title: 'Blank identifier: advanced usage patterns' },
					{
						id: '1.2.18',
						title: 'Package initialization: import side effects',
					},
				],
			},
			{
				title: 'Advanced Types (1 неделя)',
				topics: [
					{ id: '1.3.1', title: 'Type aliases vs type definitions' },
					{ id: '1.3.2', title: 'Anonymous structs and fields' },
					{ id: '1.3.3', title: 'Function types and closures advanced' },
					{ id: '1.3.4', title: 'Interface composition and embedding' },
					{ id: '1.3.5', title: 'Type switches advanced patterns' },
					{ id: '1.3.6', title: 'Custom types with methods' },
					{ id: '1.3.7', title: 'Comparable types and equality' },
				],
			},
			{
				title: 'Error Handling & Panics (1 неделя)',
				topics: [
					{ id: '1.4.1', title: 'Error interface: implementation patterns' },
					{
						id: '1.4.2',
						title: 'Error wrapping: errors.Wrap, errors.Is, errors.As',
					},
					{ id: '1.4.3', title: 'Custom error types: structured errors' },
					{ id: '1.4.4', title: 'Panic and recover: when to use, patterns' },
					{ id: '1.4.5', title: 'Error handling best practices' },
					{ id: '1.4.6', title: 'Sentinel errors vs error types' },
					{ id: '1.4.7', title: 'Error handling in concurrent code' },
				],
			},
		],
	},
	{
		id: 2,
		title: 'Go Tooling & Development',
		description:
			'Полное изучение инструментов разработки, системы сборки, отладки и управления качеством кода.',
		duration: '4 недели',
		progress: 40,
		status: 'FAANG Focus',
		sections: [
			{
				title: 'Build System (1 неделя)',
				topics: [
					{ id: '2.1.1', title: 'go build: flags, output, optimization' },
					{ id: '2.1.2', title: 'Build constraints: OS, arch, custom tags' },
					{ id: '2.1.3', title: 'Linker flags: -ldflags, version injection' },
					{
						id: '2.1.4',
						title: 'Compiler flags: -gcflags, optimization levels',
					},
					{ id: '2.1.5', title: 'Module proxies: GOPROXY, private modules' },
					{ id: '2.1.6', title: 'Vendor directory: go mod vendor, usage' },
					{ id: '2.1.7', title: 'Go workspace: multi-module development' },
				],
			},
			{
				title: 'Code Quality Tools (1 неделя)',
				topics: [
					{ id: '2.2.1', title: 'golint: style guidelines (deprecated)' },
					{ id: '2.2.2', title: 'golangci-lint: comprehensive linting' },
					{ id: '2.2.3', title: 'staticcheck: advanced static analysis' },
					{ id: '2.2.4', title: 'gosec: security vulnerability scanner' },
					{ id: '2.2.5', title: 'goimports: import management' },
					{ id: '2.2.6', title: 'gofumpt: stricter formatting' },
					{ id: '2.2.7', title: 'govulncheck: vulnerability database' },
				],
			},
			{
				title: 'Debugging & Profiling (1 неделя)',
				topics: [
					{ id: '2.3.1', title: 'Delve debugger: installation, usage' },
					{ id: '2.3.2', title: 'pprof: CPU, memory, goroutine profiling' },
					{ id: '2.3.3', title: 'go tool trace: execution tracer' },
					{ id: '2.3.4', title: 'go tool objdump: assembly inspection' },
					{ id: '2.3.5', title: 'Runtime debugging: GODEBUG variables' },
					{ id: '2.3.6', title: 'Memory debugging: heap dumps, analysis' },
					{ id: '2.3.7', title: 'Race detector: -race flag, detection' },
				],
			},
			{
				title: 'Package Management (1 неделя)',
				topics: [
					{ id: '2.4.1', title: 'Module versioning: semantic versioning' },
					{ id: '2.4.2', title: 'Replace directives: local development' },
					{ id: '2.4.3', title: 'Retract directives: version withdrawal' },
					{ id: '2.4.4', title: 'Module authentication: checksum database' },
					{ id: '2.4.5', title: 'Private repositories: GOPRIVATE setup' },
					{ id: '2.4.6', title: 'Module publishing: best practices' },
					{
						id: '2.4.7',
						title: 'Dependency management: minimal version selection',
					},
				],
			},
		],
	},
	{
		id: 3,
		title: 'Runtime & Performance',
		description:
			'Глубокое изучение Go runtime, управления памятью, garbage collector и продвинутых паттернов конкурентности.',
		duration: '4 недели',
		progress: 20,
		status: 'FAANG Focus',
		sections: [
			{
				title: 'Memory Management Deep Dive (1 неделя)',
				topics: [
					{ id: '3.1.1', title: 'Stack vs Heap allocation: escape analysis' },
					{ id: '3.1.2', title: 'Garbage collector tuning: GOGC, GOMEMLIMIT' },
					{ id: '3.1.3', title: 'Memory pools: sync.Pool patterns' },
					{ id: '3.1.4', title: 'Memory profiling: identifying leaks' },
					{ id: '3.1.5', title: 'Arena allocators: experimental features' },
					{ id: '3.1.6', title: 'Finalizers: runtime.SetFinalizer' },
					{ id: '3.1.7', title: 'Memory layout: struct padding, alignment' },
				],
			},
			{
				title: 'Runtime Internals (1 неделя)',
				topics: [
					{ id: '3.2.1', title: 'Scheduler deep dive: work stealing' },
					{ id: '3.2.2', title: 'Netpoller: epoll, kqueue implementation' },
					{ id: '3.2.3', title: 'Timer implementation: runtime timers' },
					{ id: '3.2.4', title: 'Signal handling: os/signal package' },
					{ id: '3.2.5', title: 'Runtime hooks: init functions order' },
					{ id: '3.2.6', title: 'Program startup: runtime initialization' },
					{ id: '3.2.7', title: 'Runtime statistics: runtime.MemStats' },
				],
			},
			{
				title: 'Concurrency Advanced (1 неделя)',
				topics: [
					{ id: '3.3.1', title: 'Worker pools: bounded concurrency' },
					{ id: '3.3.2', title: 'Pipeline patterns: advanced compositions' },
					{ id: '3.3.3', title: 'Semaphore patterns: weighted semaphores' },
					{ id: '3.3.4', title: 'Barrier synchronization: sync primitives' },
					{ id: '3.3.5', title: 'Lock-free programming: atomic operations' },
					{ id: '3.3.6', title: 'Conditional variables: sync.Cond' },
					{ id: '3.3.7', title: 'Goroutine leaks: detection, prevention' },
				],
			},
			{
				title: 'Go Runtime Advanced (1 неделя)',
				topics: [
					{ id: '3.4.1', title: 'Build modes: shared libraries, c-archive' },
					{ id: '3.4.2', title: 'Runtime hacking: accessing internals' },
					{ id: '3.4.3', title: 'Scheduler affinity: GOMAXPROCS tuning' },
					{ id: '3.4.4', title: 'GC latency optimization: real-world tuning' },
					{ id: '3.4.5', title: 'Memory ballast: optimization techniques' },
					{ id: '3.4.6', title: 'Runtime experiments: GOEXPERIMENT flags' },
					{ id: '3.4.7', title: 'Go runtime evolution: version differences' },
				],
			},
		],
	},
	{
		id: 4,
		title: 'Integration & Interop',
		description:
			'CGO программирование, ассемблер, система плагинов и интеграция с другими языками.',
		duration: '3 недели',
		progress: 0,
		sections: [
			{
				title: 'CGO Programming (1 неделя)',
				topics: [
					{ id: '4.1.1', title: 'CGO basics: calling C from Go' },
					{ id: '4.1.2', title: 'C types in Go: conversions, memory' },
					{ id: '4.1.3', title: 'Callbacks: Go functions in C' },
					{ id: '4.1.4', title: 'Memory management: C allocations' },
					{ id: '4.1.5', title: 'Build configuration: pkg-config, flags' },
					{ id: '4.1.6', title: 'CGO alternatives: pure Go implementations' },
					{ id: '4.1.7', title: 'Performance implications: CGO overhead' },
				],
			},
			{
				title: 'Assembly Programming (1 неделя)',
				topics: [
					{ id: '4.2.1', title: 'Plan 9 assembly: Go assembly syntax' },
					{ id: '4.2.2', title: 'Function calls: calling conventions' },
					{ id: '4.2.3', title: 'Register usage: AMD64 specifics' },
					{ id: '4.2.4', title: 'Assembly optimization: critical paths' },
					{ id: '4.2.5', title: 'Debugging assembly: objdump usage' },
					{ id: '4.2.6', title: 'Inline assembly: compiler intrinsics' },
					{ id: '4.2.7', title: 'Cross-platform assembly: build tags' },
				],
			},
			{
				title: 'Plugin System (1 неделя)',
				topics: [
					{ id: '4.3.1', title: 'Plugin package: dynamic loading' },
					{ id: '4.3.2', title: 'Symbol resolution: lookup functions' },
					{ id: '4.3.3', title: 'Plugin architecture: design patterns' },
					{ id: '4.3.4', title: 'Build plugins: compilation requirements' },
					{ id: '4.3.5', title: 'Plugin limitations: platform support' },
					{
						id: '4.3.6',
						title: 'Alternative approaches: interfaces, configuration',
					},
					{ id: '4.3.7', title: 'Plugin security: sandboxing considerations' },
				],
			},
		],
	},
	{
		id: 5,
		title: 'Standard Library Deep Dive',
		description:
			'Глубокое изучение стандартной библиотеки Go, системного программирования, криптографии и логирования.',
		duration: '5 недель',
		progress: 0,
		sections: [
			{
				title: 'System Programming (1 неделя)',
				topics: [
					{ id: '5.1.1', title: 'os package: process, environment' },
					{ id: '5.1.2', title: 'syscall package: low-level system calls' },
					{ id: '5.1.3', title: 'exec package: external command execution' },
					{ id: '5.1.4', title: 'Signal handling: graceful shutdown' },
					{ id: '5.1.5', title: 'File system: permissions, metadata' },
					{ id: '5.1.6', title: 'Process management: PID, process groups' },
					{ id: '5.1.7', title: 'System resources: ulimits, monitoring' },
				],
			},
			{
				title: 'Crypto & Security (1 неделя)',
				topics: [
					{ id: '5.2.1', title: 'crypto package: overview, random' },
					{ id: '5.2.2', title: 'Hash functions: SHA, MD5, custom' },
					{ id: '5.2.3', title: 'Symmetric encryption: AES, DES' },
					{ id: '5.2.4', title: 'Asymmetric crypto: RSA, ECDSA' },
					{ id: '5.2.5', title: 'TLS implementation: certificates, handshake' },
					{ id: '5.2.6', title: 'X.509 certificates: parsing, validation' },
					{ id: '5.2.7', title: 'Cryptographic protocols: implementation' },
				],
			},
			{
				title: 'Configuration & CLI (1 неделя)',
				topics: [
					{ id: '5.3.1', title: 'flag package: command-line parsing' },
					{ id: '5.3.2', title: 'Configuration files: JSON, YAML, TOML' },
					{ id: '5.3.3', title: 'Environment variables: os.Getenv patterns' },
					{ id: '5.3.4', title: 'Configuration libraries: viper, cobra' },
					{ id: '5.3.5', title: 'CLI frameworks: urfave/cli, spf13/cobra' },
					{ id: '5.3.6', title: 'Subcommands: implementation patterns' },
					{ id: '5.3.7', title: 'Auto-completion: shell integration' },
				],
			},
			{
				title: 'Logging & Observability (1 неделя)',
				topics: [
					{ id: '5.4.1', title: 'log package: standard logging' },
					{ id: '5.4.2', title: 'Structured logging: JSON, key-value' },
					{ id: '5.4.3', title: 'Log levels: debug, info, warn, error' },
					{ id: '5.4.4', title: 'Log rotation: file management' },
					{ id: '5.4.5', title: 'Logging libraries: logrus, zap, zerolog' },
					{ id: '5.4.6', title: 'Metrics collection: expvar, prometheus' },
					{ id: '5.4.7', title: 'Tracing: context propagation, spans' },
				],
			},
			{
				title: 'Advanced Standard Library (1 неделя)',
				topics: [
					{ id: '5.5.1', title: 'reflect package: deep dive, performance' },
					{ id: '5.5.2', title: 'unsafe package: when and how to use' },
					{ id: '5.5.3', title: 'context package: advanced patterns, values' },
					{
						id: '5.5.4',
						title: 'sync package: advanced primitives (Once, Map)',
					},
					{ id: '5.5.5', title: 'sort package: custom sorting, interfaces' },
					{
						id: '5.5.6',
						title: 'testing package: advanced patterns, benchmarks',
					},
					{
						id: '5.5.7',
						title: 'embed package: static assets, build-time inclusion',
					},
				],
			},
		],
	},
	{
		id: 6,
		title: 'Testing & Quality Assurance',
		description:
			'Comprehensive testing strategies, benchmarking, fuzzing, и обеспечение качества кода.',
		duration: '3 недели',
		progress: 0,
		sections: [
			{
				title: 'Testing Fundamentals (1 неделя)',
				topics: [
					{ id: '6.1.1', title: 'testing package: unit tests, table tests' },
					{ id: '6.1.2', title: 'Test organization: naming, structure' },
					{ id: '6.1.3', title: 'Test helpers: setup, teardown' },
					{ id: '6.1.4', title: 'Test fixtures: data management' },
					{ id: '6.1.5', title: 'Subtests: t.Run patterns' },
					{ id: '6.1.6', title: 'Test coverage: go test -cover' },
					{ id: '6.1.7', title: 'Test caching: build cache behavior' },
				],
			},
			{
				title: 'Advanced Testing (1 неделя)',
				topics: [
					{ id: '6.2.1', title: 'Benchmarking: performance testing' },
					{ id: '6.2.2', title: 'Fuzzing: property-based testing' },
					{ id: '6.2.3', title: 'Mock generation: gomock, testify' },
					{ id: '6.2.4', title: 'Integration testing: testcontainers' },
					{ id: '6.2.5', title: 'Test doubles: mocks, stubs, fakes' },
					{ id: '6.2.6', title: 'Property-based testing: gofuzz' },
					{ id: '6.2.7', title: 'Mutation testing: quality assessment' },
				],
			},
			{
				title: 'Testing Patterns (1 неделя)',
				topics: [
					{ id: '6.3.1', title: 'Dependency injection: testing seams' },
					{ id: '6.3.2', title: 'Interface-based testing: mock interfaces' },
					{ id: '6.3.3', title: 'Test data builders: fluent APIs' },
					{ id: '6.3.4', title: 'Golden file testing: snapshot testing' },
					{ id: '6.3.5', title: 'Test parallelization: t.Parallel()' },
					{ id: '6.3.6', title: 'Test timeouts: context.WithTimeout' },
					{ id: '6.3.7', title: 'Flaky test prevention: deterministic tests' },
				],
			},
		],
	},
	{
		id: 7,
		title: 'Performance & Optimization',
		description:
			'Performance analysis, optimization techniques, и compiler optimizations для высокопроизводительных приложений.',
		duration: '3 недели',
		progress: 0,
		sections: [
			{
				title: 'Performance Analysis (1 неделя)',
				topics: [
					{
						id: '7.1.1',
						title: 'Benchmarking methodology: accurate measurements',
					},
					{ id: '7.1.2', title: 'CPU profiling: hotspot identification' },
					{ id: '7.1.3', title: 'Memory profiling: allocation analysis' },
					{ id: '7.1.4', title: 'Goroutine profiling: concurrency analysis' },
					{ id: '7.1.5', title: 'Block profiling: contention detection' },
					{ id: '7.1.6', title: 'Mutex profiling: lock contention' },
					{ id: '7.1.7', title: 'Execution tracing: timeline analysis' },
				],
			},
			{
				title: 'Optimization Techniques (1 неделя)',
				topics: [
					{
						id: '7.2.1',
						title: 'Algorithm optimization: Big O considerations',
					},
					{ id: '7.2.2', title: 'Memory optimization: reduce allocations' },
					{ id: '7.2.3', title: 'CPU optimization: reduce computation' },
					{ id: '7.2.4', title: 'Cache-friendly patterns: data locality' },
					{ id: '7.2.5', title: 'String optimization: builder, intern' },
					{ id: '7.2.6', title: 'JSON optimization: streaming, pooling' },
					{
						id: '7.2.7',
						title: 'Reflection optimization: caching, alternatives',
					},
				],
			},
			{
				title: 'Compiler Optimizations (1 неделя)',
				topics: [
					{ id: '7.3.1', title: 'Inlining: function call elimination' },
					{ id: '7.3.2', title: 'Escape analysis: stack allocation' },
					{ id: '7.3.3', title: 'Dead code elimination: unused code' },
					{ id: '7.3.4', title: 'Constant folding: compile-time evaluation' },
					{
						id: '7.3.5',
						title: 'Loop optimizations: unrolling, vectorization',
					},
					{ id: '7.3.6', title: 'Bounds check elimination: slice safety' },
					{
						id: '7.3.7',
						title: 'Devirtualization: interface call optimization',
					},
				],
			},
		],
	},
	{
		id: 8,
		title: 'Advanced Language Features',
		description:
			'Generics mastery, reflection deep dive, code generation и advanced Go features.',
		duration: '3 недели',
		progress: 0,
		sections: [
			{
				title: 'Generics Mastery (1 неделя)',
				topics: [
					{ id: '8.1.1', title: 'Type parameters: declaration, usage' },
					{ id: '8.1.2', title: 'Type constraints: interface constraints' },
					{ id: '8.1.3', title: 'Type inference: automatic deduction' },
					{ id: '8.1.4', title: 'Generic data structures: implementation' },
					{ id: '8.1.5', title: 'Generic algorithms: reusable functions' },
					{ id: '8.1.6', title: 'Performance implications: monomorphization' },
					{
						id: '8.1.7',
						title: 'Migration strategies: from interface{} to generics',
					},
				],
			},
			{
				title: 'Reflection Deep Dive (1 неделя)',
				topics: [
					{ id: '8.2.1', title: 'Type and Value: reflect fundamentals' },
					{ id: '8.2.2', title: 'Struct tag processing: custom unmarshaling' },
					{ id: '8.2.3', title: 'Method invocation: dynamic calls' },
					{ id: '8.2.4', title: 'Type creation: reflect.New patterns' },
					{
						id: '8.2.5',
						title: 'Performance considerations: caching strategies',
					},
					{ id: '8.2.6', title: 'Reflection alternatives: code generation' },
					{ id: '8.2.7', title: 'Security implications: reflection risks' },
				],
			},
			{
				title: 'Code Generation (1 неделя)',
				topics: [
					{ id: '8.3.1', title: 'go:generate directive: automation' },
					{ id: '8.3.2', title: 'Template-based generation: text/template' },
					{ id: '8.3.3', title: 'AST manipulation: go/ast, go/parser' },
					{ id: '8.3.4', title: 'Source code analysis: go/doc, go/types' },
					{ id: '8.3.5', title: 'Build-time generation: embedding' },
					{ id: '8.3.6', title: 'Protocol buffer generation: protoc-gen-go' },
					{ id: '8.3.7', title: 'Custom code generators: tooling' },
				],
			},
		],
	},
];

const databaseData: Module[] = [
	{
		id: 1,
		title: 'SQL Fundamentals',
		description:
			'Основы работы с реляционными базами данных, SQL синтаксис, проектирование схем.',
		duration: '3 недели',
		progress: 0,
		sections: [
			{
				title: 'Введение в SQL',
				topics: [
					{ id: 'db.1.1', title: 'Что такое базы данных и СУБД' },
					{ id: 'db.1.2', title: 'Реляционная модель данных' },
					{ id: 'db.1.3', title: 'Первичные и внешние ключи' },
					{ id: 'db.1.4', title: 'Нормализация данных' },
				],
			},
			{
				title: 'Основные SQL операции',
				topics: [
					{ id: 'db.1.5', title: 'SELECT: выборка данных' },
					{ id: 'db.1.6', title: 'INSERT, UPDATE, DELETE' },
					{ id: 'db.1.7', title: 'JOIN: объединение таблиц' },
					{ id: 'db.1.8', title: 'GROUP BY и агрегатные функции' },
				],
			},
		],
	},
	{
		id: 2,
		title: 'Database Design & Optimization',
		description:
			'Проектирование эффективных схем баз данных, индексы, оптимизация запросов.',
		duration: '4 недели',
		progress: 0,
		sections: [
			{
				title: 'Проектирование схем',
				topics: [
					{ id: 'db.2.1', title: 'ER-диаграммы и моделирование' },
					{ id: 'db.2.2', title: 'Выбор типов данных' },
					{ id: 'db.2.3', title: 'Ограничения целостности' },
					{ id: 'db.2.4', title: 'Денормализация для производительности' },
				],
			},
			{
				title: 'Оптимизация и индексы',
				topics: [
					{ id: 'db.2.5', title: 'Типы индексов: B-tree, Hash, Bitmap' },
					{ id: 'db.2.6', title: 'Анализ планов выполнения' },
					{ id: 'db.2.7', title: 'Оптимизация сложных запросов' },
					{ id: 'db.2.8', title: 'Партиционирование таблиц' },
				],
			},
		],
	},
];

const ModulesHome = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState('all-modules');

	const t = useTranslations('homepage');
	const tCommon = useTranslations('common');

	const arrangeTopicsInColumns = (
		topics: Topic[],
		columnCount: number = 3,
	): Topic[][] => {
		const itemsPerColumn = Math.ceil(topics.length / columnCount);
		const columns: Topic[][] = [];

		for (let i = 0; i < columnCount; i++) {
			const start = i * itemsPerColumn;
			const end = start + itemsPerColumn;
			columns.push(topics.slice(start, end));
		}

		return columns.filter((column) => column.length > 0);
	};

	const filterModules = (modules: Module[], query: string): Module[] => {
		if (!query) return modules;

		return modules
			.map((module) => ({
				...module,
				sections: module.sections
					.map((section) => ({
						...section,
						topics: section.topics.filter((topic) =>
							topic.title.toLowerCase().includes(query.toLowerCase()),
						),
					}))
					.filter((section) => section.topics.length > 0),
			}))
			.filter((module) => module.sections.length > 0);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Search:', searchQuery);
	};

	return (
		<div className='mx-auto max-w-6xl px-6 py-6'>
			<div className='text-muted-foreground mb-2 text-sm'>
				{tCommon('lastUpdate', { date: '20 июня 2025 г.' })}
			</div>

			<h1 className='mb-3 text-3xl font-bold tracking-tight'>{t('title')}</h1>

			<div className='text-muted-foreground mb-6 max-w-2xl'>
				{t('description')}
			</div>

			<div className='mb-8 flex items-center gap-4'>
				<form onSubmit={handleSearch} className='flex max-w-md flex-1 gap-2'>
					<Input
						type='text'
						placeholder={t('searchPlaceholder')}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='flex-1'
					/>
					<Button type='submit' size='sm'>
						{tCommon('find')}
					</Button>
				</form>

				<div className='flex items-center gap-2 text-sm'>
					<Star className='h-4 w-4 text-orange-500' />
					<span className='text-primary font-medium'>3933</span>
					<span className='text-muted-foreground'>{tCommon('github')}</span>
				</div>
			</div>

			<div className='mb-8'>
				<h2 className='mb-3 text-xl font-semibold'>{t('contents')}</h2>
				<p className='text-muted-foreground max-w-3xl text-sm'>
					{t('contentsDescription')}
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
				<TabsList className='bg-muted/50 grid h-auto w-full grid-cols-3 p-1'>
					<TabsTrigger
						value='all-modules'
						className='data-[state=inactive]:text-foreground flex h-auto flex-col gap-1 py-3 data-[state=inactive]:opacity-100'
					>
						<span className='font-medium'>ВСЕ МОДУЛИ</span>
						<span className='text-muted-foreground text-xs'>Go Language</span>
					</TabsTrigger>
					<TabsTrigger
						value='databases'
						className='data-[state=inactive]:text-foreground flex h-auto flex-col gap-1 py-3 data-[state=inactive]:opacity-100'
					>
						<span className='font-medium'>БАЗЫ ДАННЫХ</span>
						<span className='text-muted-foreground text-xs'>SQL & NoSQL</span>
					</TabsTrigger>
					<TabsTrigger
						value='network'
						className='data-[state=inactive]:text-foreground flex h-auto flex-col gap-1 py-3 data-[state=inactive]:opacity-100'
					>
						<span className='font-medium'>СЕТЬ</span>
						<span className='text-muted-foreground text-xs'>
							HTTP & Protocols
						</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value='all-modules' className='mt-6'>
					<div className='space-y-12'>
						{filterModules(allModulesData, searchQuery).map((module) => (
							<div key={module.id} className='space-y-6'>
								<div className='flex items-start justify-between'>
									<div className='space-y-2'>
										<div className='flex items-center gap-3'>
											<h3 className='text-2xl font-bold'>{module.title}</h3>
											{module.status && (
												<Badge
													variant='secondary'
													className='bg-orange-100 text-orange-800'
												>
													{module.status}
												</Badge>
											)}
										</div>
										<p className='text-muted-foreground max-w-3xl text-sm'>
											{module.description}
										</p>
										<div className='text-muted-foreground flex items-center gap-4 text-sm'>
											<span>📅 {module.duration}</span>
											<span>📊 {module.progress}% завершено</span>
										</div>
									</div>
								</div>

								<div className='space-y-2'>
									<div className='flex justify-between text-sm'>
										<span>Прогресс модуля</span>
										<span>{module.progress}%</span>
									</div>
									<Progress value={module.progress} className='h-2' />
								</div>

								<div className='space-y-8'>
									{module.sections.map((section, sectionIndex) => (
										<div key={sectionIndex} className='space-y-4'>
											<h4 className='text-foreground text-lg font-semibold'>
												{section.title}
											</h4>

											<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
												{arrangeTopicsInColumns(section.topics, 3).map(
													(column, columnIndex) => (
														<div key={columnIndex} className='space-y-1'>
															{column.map((topic) => (
																<div
																	key={topic.id}
																	className='hover:bg-muted/50 flex items-center gap-3 rounded px-3 py-2 transition-colors'
																>
																	<span className='text-muted-foreground min-w-[3rem] font-mono text-xs'>
																		{topic.id}
																	</span>
																	<a
																		href='#'
																		className='flex-1 text-sm text-blue-600 hover:text-blue-800 hover:underline'
																	>
																		{topic.title}
																	</a>
																</div>
															))}
														</div>
													),
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</TabsContent>

				<TabsContent value='databases' className='mt-6'>
					<div className='space-y-12'>
						<div className='py-8 text-center'>
							<h3 className='mb-4 text-2xl font-bold'>Базы данных</h3>
							<p className='text-muted-foreground mx-auto mb-6 max-w-2xl'>
								Изучение SQL и NoSQL баз данных, проектирование схем,
								оптимизация запросов и работа с различными СУБД.
							</p>
						</div>

						{filterModules(databaseData, searchQuery).map((module) => (
							<div key={module.id} className='space-y-6'>
								<div className='flex items-start justify-between'>
									<div className='space-y-2'>
										<h4 className='text-xl font-bold'>{module.title}</h4>
										<p className='text-muted-foreground max-w-3xl text-sm'>
											{module.description}
										</p>
										<div className='text-muted-foreground flex items-center gap-4 text-sm'>
											<span>📅 {module.duration}</span>
											<span>📊 {module.progress}% завершено</span>
										</div>
									</div>
								</div>

								<div className='space-y-2'>
									<div className='flex justify-between text-sm'>
										<span>Прогресс модуля</span>
										<span>{module.progress}%</span>
									</div>
									<Progress value={module.progress} className='h-2' />
								</div>

								<div className='space-y-8'>
									{module.sections.map((section, sectionIndex) => (
										<div key={sectionIndex} className='space-y-4'>
											<h5 className='text-foreground text-lg font-semibold'>
												{section.title}
											</h5>

											<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
												{arrangeTopicsInColumns(section.topics, 3).map(
													(column, columnIndex) => (
														<div key={columnIndex} className='space-y-1'>
															{column.map((topic) => (
																<div
																	key={topic.id}
																	className='hover:bg-muted/50 flex items-center gap-3 rounded px-3 py-2 transition-colors'
																>
																	<span className='text-muted-foreground min-w-[3rem] font-mono text-xs'>
																		{topic.id}
																	</span>
																	<a
																		href='#'
																		className='flex-1 text-sm text-blue-600 hover:text-blue-800 hover:underline'
																	>
																		{topic.title}
																	</a>
																</div>
															))}
														</div>
													),
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</TabsContent>

				<TabsContent value='network' className='mt-6'>
					<div className='py-16 text-center'>
						<h3 className='mb-4 text-2xl font-bold'>
							Сетевое программирование
						</h3>
						<p className='text-muted-foreground mb-6'>
							Этот раздел находится в разработке. Скоро здесь появятся материалы
							по HTTP, TCP/IP, WebSocket и другим сетевым протоколам.
						</p>
						<Button variant='outline'>Уведомить о готовности</Button>
					</div>
				</TabsContent>
			</Tabs>

			<div className='mt-12 border-t pt-8'>
				<div className='bg-muted/50 rounded-lg p-6'>
					<h3 className='mb-4 text-lg font-semibold'>
						{tCommon('overallProgress', { percent: '33' })}
					</h3>
					<Progress value={33} className='mb-4 h-3' />
					<p className='text-muted-foreground text-sm'>
						{t('completedModules', { completed: '2', total: '8' })}
					</p>
				</div>
			</div>
		</div>
	);
};

export default ModulesHome;
