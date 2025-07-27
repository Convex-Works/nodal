import { error } from '@sveltejs/kit'
import { examples } from '../../examples.js';

export const prerender = true;
export async function load({ params }) {
  try {
    return examples[params.slug];
  } catch (e) {
    console.error(e)
  }
}
