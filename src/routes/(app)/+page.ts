import { examples } from "../examples.js"

export const prerender = true;
export async function load({ params }) {
  try {
    return {
      examples
    }
  } catch (e) { }
}
