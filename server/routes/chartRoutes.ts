import { Router, Request, Response } from 'express';
import chartController from '../controllers/chartController';
import openaiController from '../controllers/openaiController';

const router = Router();
//defining router

router.get('/', chartController.getChart, (req: Request, res: Response) => {
  //   console.log('getChart', res.locals.chartData);
  return res.status(200).json({ getChart: res.locals.chartData });
});
router.post('/query', openaiController.handleQuery);
export default router;
