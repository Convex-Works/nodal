const paths = import.meta.glob('/src/examples/*.md.svelte', { eager: true })
export const examples: Record<string, {
  meta: Record<string, any>,
  content: any,
  code: string,
  href: string,
  name: string,
  path: string
}> = {};
console.time("Example preload");
for await (const [path, file] of Object.entries(paths)) {
  console.log("path->", path)
  const slug = path.replace('/src/examples/', '').replace('.md.svelte', '');
  // const raw = (await import(path + "?raw")).default
  const raw = (await import(`../examples/${slug}.md.svelte` + "?raw")).default
  examples[slug] = {
    meta: (file as any).metadata || {},
    content: (await import(`../examples/${slug}.md.svelte`)).default,
    code: raw.substring(raw.search("<script ")),
    href: slug,
    name: (file as any).metadata?.title || 'Example',
    path
  }
}
console.log(`Loaded ${examples.length}`)
console.timeEnd("Example preload")
