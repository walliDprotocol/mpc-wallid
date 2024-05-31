import { Router, Request, Response } from 'express';
// import { TokenEntry } from 'src/types/auth';

// import DB from 'src/database';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('user');

const router = Router();

/**
 * Get user Balance
 */
router.get('/balance', async (req: Request, res: Response) => {
  logDebug('Route /balance', req.user);

  try {
    res.send({ route: 'balance' });
  } catch (error) {
    logError(error);
  }
});

export default router;
