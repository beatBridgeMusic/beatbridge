import db from '../models/songsDatabaseModel';
import { Request, Response, NextFunction } from 'express';

interface SongsController {
  getSongs(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllSongs(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllTrackNames(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}

// index signature
interface SortableMetrics {
  [key: string]: string;
}

// TODO: figure out how to validate inputs
const SORTABLE_METRICS: SortableMetrics = {
  artist_name: 'artist_name',
  track_name: 'track_name',
  release_date: 'release_date',
  duration: 'duration',
  popularity: 'popularity',
  danceability: 'danceability',
  energy: 'energy',
  loudness: 'loudness',
  speechiness: 'speechiness',
  acousticness: 'acousticness',
  instrumentalness: 'instrumentalness',
  liveness: 'liveness',
  valence: 'valence',
  tempo: 'tempo',
};

const songsController: SongsController = {
  async getSongs(req, res, next) {
    console.log('get songs called');
    try {
      const { sort, dir } = req.query;
      const result = await db.query(
        `SELECT track_name FROM groovin ORDER BY ${sort} ${dir}`
      );
      res.locals.songsList = result.rows;
      console.log(res.locals.songsList);
      return next();
    } catch (error) {
      return next({
        log: 'error in getAllSongs function',
        status: 500,
        message: { err: error.message },
      });
    }
  },

  async getAllSongs(req, res, next) {
    console.log('get all songs called');
    try {
      const result = await db.query('SELECT * FROM groovin');
      res.locals.songsList = result.rows;
      // console.log(res.locals.songsList);
      return next();
    } catch (error) {
      return next({
        log: 'error in getAllSongs function',
        status: 500,
        message: { err: error.message },
      });
    }
  },

  async getAllTrackNames(req, res, next) {
    console.log('get all track names called');
    try {
      const result = await db.query('SELECT track_names FROM groovin');
      res.locals.songsList = result.rows;
      console.log(res.locals.songsList);
      return next();
    } catch (error) {
      return next({
        log: 'error in getAllTrackNames function',
        status: 500,
        message: { err: error.message },
      });
    }
  },
};

export default songsController;
