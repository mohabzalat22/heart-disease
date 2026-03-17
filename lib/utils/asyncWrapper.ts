export default async function asyncWrapper<T>(
  fn: () => Promise<T>
): Promise<T | null> {
  try {
    const data = await fn();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
