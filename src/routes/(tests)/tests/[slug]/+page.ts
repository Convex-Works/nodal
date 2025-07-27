import { error } from '@sveltejs/kit'
import { examples } from '../../../examples.js';
import type { EntryGenerator } from './$types.js';

export const prerender = true;

export const entries: EntryGenerator = () => {
  return Object.keys(examples).map((slug) => ({ slug }));
};

export async function load({ params }) {
  try {
    return examples[params.slug];
  } catch (e) {
    console.error(e)
  }
}
