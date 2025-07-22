import { error } from '@sveltejs/kit'

export async function load({ params }) {
  try {
    const post = await import(`../../examples/${params.slug}.md.svelte`);
    const content = (await import(`../../examples/${params.slug}.md.svelte?raw`)).default;
    // console.log("content", content.default)
    // console.log(" -> post : ", post, Object.keys(post))

    // read the file
    // const content = readFileSync(post., 'utf-8')

    return {
      content: post.default,
      meta: post.metadata,
      code: content.substring(content.search("<script "))
    }
  } catch (e) {
    console.error(e)
  }
}
