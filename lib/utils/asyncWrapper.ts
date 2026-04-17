import { logger } from '../logger';

export default async function asyncWrapper<T>(
  fn: () => Promise<T>
): Promise<T | null> {
  try {
    const data = await fn();
    return data;
  } catch (error) {
    logger.error(error, 'An Error Occured');
    return null;
  }
}
