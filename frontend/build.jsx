import esbuild from 'esbuild';

esbuild.build({
    entryPoints: ['src/index.js'], // Главная точка входа
    bundle: true,
    outdir: 'dist', // Директория для выхода сборки
    loader: {
        '.js': 'jsx', // Обработка файлов с JSX
    },
    define: {
        'process.env.NODE_ENV': '"production"', // Установка переменной среды
    },
}).catch(() => process.exit(1));