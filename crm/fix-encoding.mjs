import { readFileSync, writeFileSync } from 'fs';

const file = 'src/app/components/settings/TgParserSection.tsx';
const raw = readFileSync(file, 'utf8');
// Файл дважды закодирован: UTF-8 → отображён как Latin-1 → снова UTF-8
// Обратный путь: прочитать как строку, перекодировать обратно через latin-1 buffer
const fixed = Buffer.from(raw, 'binary').toString('utf8');
writeFileSync(file, fixed, 'utf8');
console.log(`Fixed. Lines: ${fixed.split('\n').length}`);
// Проверим что кириллица восстановилась
const check = fixed.match(/[а-яА-Я]/g);
console.log(`Cyrillic chars found: ${check?.length ?? 0}`);
