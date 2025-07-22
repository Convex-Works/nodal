export async function load({ params }) {
  try {
   	const paths = import.meta.glob('/src/examples/*.md.svelte', { eager: true })
    console.log("paths are: ", paths)

    return {
      examples: Object.entries(paths).map(([path, file]) => ({
        path,
        name: file.metadata?.title || 'Untitled',
        href: path.replace('/src/examples/', '').replace('.md.svelte', ''),
      }!))
    }
  } catch (e) {}
}
