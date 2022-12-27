import { exitPreview } from '@prismicio/next';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function exit(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  await exitPreview({ res, req });
}
