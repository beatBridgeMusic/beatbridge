import { Request, Response, NextFunction } from 'express';

interface ChartController {
  getChart(req: Request, res: Response, next: NextFunction): Promise<void>;
}

const chartController: ChartController = {
  async getChart(req, res, next) {
    const url =
      'https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/refs/heads/main/recent.json';
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      console.log('data from recent.json github', data);
      console.log('total songs', data.data.length);
      res.locals.chartData = data;
      return next();
    } catch (error) {
      return next({
        log: `Error in chartController.getChart:${error.message}`,
        status: 500,
        message: {
          err: `chartController.getChart: Error: Check Server logs for details`,
        },
      });
    }
  },
};
export default chartController;
