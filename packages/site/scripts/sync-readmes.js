import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const outDir = resolve(__dirname, '../content/docs/packages');

const mappings = [
    {
        source: 'packages/proxy/README.md',
        target: 'proxy.mdx',
        title: 'graphql2mcp',
        description: 'Standalone CLI proxy — run any GraphQL endpoint as an MCP server.'
    },
    {
        source: 'packages/lib/README.md',
        target: 'lib.mdx',
        title: '@graphql2mcp/lib',
        description: 'Library for integrating GraphQL-to-MCP conversion into existing TypeScript MCP servers.'
    }
];

// Badge pattern: [![alt](shield-url)](link-url)
const badgeRe = /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;

function badgeLinesToFlex(badgeLines) {
    const badges = [];
    for (const line of badgeLines) {
        for (const match of line.matchAll(badgeRe)) {
            badges.push({ alt: match[1], img: match[2], href: match[3] });
        }
    }
    if (badges.length === 0) return badgeLines.join('\n');

    const links = badges.map(b => `  <a href="${b.href}"><img src="${b.img}" alt="${b.alt}" /></a>`);
    return `<div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>\n${links.join('\n')}\n</div>`;
}

function collapseBlankLines(lines) {
    const cleaned = [];
    let blanks = 0;
    for (const line of lines) {
        const isBlank = line.trim() === '';
        blanks = isBlank ? blanks + 1 : 0;
        if (!isBlank || blanks <= 2) cleaned.push(line);
    }
    return cleaned;
}

function transformContent(content) {
    const lines = content.split('\n');
    const badgeLineIndices = [];

    for (let i = 0; i < lines.length; i++) {
        if (badgeRe.test(lines[i]) && lines[i].includes('shields.io')) {
            badgeLineIndices.push(i);
            badgeRe.lastIndex = 0;
        }
    }

    if (badgeLineIndices.length === 0) return content;

    const badgeLines = badgeLineIndices.map(i => lines[i]);
    const flexHtml = badgeLinesToFlex(badgeLines);
    const removeSet = new Set(badgeLineIndices);

    const result = [];
    let inserted = false;

    for (let i = 0; i < lines.length; i++) {
        if (removeSet.has(i)) continue;

        result.push(lines[i]);

        if (!inserted && lines[i].startsWith('# ')) {
            result.push('', flexHtml);
            inserted = true;
        }
    }

    return collapseBlankLines(result).join('\n');
}

mkdirSync(outDir, { recursive: true });

for (const { source, target, title, description } of mappings) {
    const content = readFileSync(resolve(root, source), 'utf8');
    const transformed = transformContent(content);
    const frontmatter = `---\ntitle: "${title}"\ndescription: "${description}"\n---\n\n`;
    writeFileSync(resolve(outDir, target), frontmatter + transformed);
}

console.log(`Synced ${mappings.length} README files to ${outDir}`);
