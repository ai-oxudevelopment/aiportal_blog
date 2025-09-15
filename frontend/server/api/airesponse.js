export default defineEventHandler(async (event) => {
  const fs = await import('fs/promises');
  const markdownString = await fs.readFile('server/api/example_response.md', 'utf8');
  return { success: true, data: markdownString };
});
