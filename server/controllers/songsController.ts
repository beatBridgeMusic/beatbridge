import db from '../models/songsDatabaseModel';
import { Request, Response, NextFunction } from 'express';

interface SongsController {
  uploadPlaylist(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSongs(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllSongs(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllTrackNames(req: Request, res: Response, next: NextFunction): Promise<void>;
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
  async uploadPlaylist(req, res, next) {
    console.log('req.body:', req.body);
    try {
      const { playlistName, rows } = req.body as { playlistName?: string; rows?: any[] };
      // Derive user id: prefer middleware (req.user.id), else accept body.userId for MVP
      const uuid = (req as any).uuid || (req.body && req.body.uuid) || null;

      if (!uuid) {
        return next({
          log: 'uploadPlaylist: missing  uuid',
          status: 401,
          message: { err: 'Unauthorized: uuid not found' },
        });
      }

      if (!Array.isArray(rows) || rows.length === 0) {
        return next({
          log: 'uploadPlaylist: no rows',
          status: 400,
          message: { err: 'No rows provided' },
        });
      }

      // arrays for bulk ops
      const positions: number[] = rows.map((_, i) => i + 1);
      const trackIds: string[] = rows.map((r) => r.track_id);
      const titles: (string | null)[] = rows.map((r) => r.title);
      const artists: (string | null)[] = rows.map((r) => r.artist);
      const albums: (string | null)[] = rows.map((r) => r.album);
      const durations: (number | null)[] = rows.map((r) =>
        r.duration_ms === null || r.duration_ms === undefined ? null : Number(r.duration_ms)
      );

      // transaction
      await db.query('BEGIN');

      // 1) create playlist
      const pl = await db.query(
        `insert into playlists (user_id, name, source)
         values ($1, $2, 'csv')
         returning id`,
        [uuid, playlistName || 'Untitled Upload']
      );
      const playlistId = pl.rows[0].id;

      // 2) upsert tracks into GLOBAL catalog
      await db.query(
        `insert into tracks (track_id, title, artist, album, duration_ms)
         select * from unnest(
           $1::text[], $2::text[], $3::text[], $4::text[], $5::int[]
         )
         on conflict (track_id) do update
         set title = coalesce(excluded.title, tracks.title),
             artist = coalesce(excluded.artist, tracks.artist),
             album = coalesce(excluded.album, tracks.album),
             duration_ms = coalesce(excluded.duration_ms, tracks.duration_ms)`,
        [trackIds, titles, artists, albums, durations]
      );

      // 3) map playlist -> tracks (preserve order)
      await db.query(
        `insert into playlist_tracks (playlist_id, position, track_id)
         select $1, t.pos, t.tid
         from unnest($2::int[], $3::text[]) as t(pos, tid)
         on conflict do nothing`,
        [playlistId, positions, trackIds]
      );

      await db.query('COMMIT');

      res.locals.uploadResult = { playlistId, rowsInserted: rows.length };
      return next();
    } catch (error: any) {
      await db.query('ROLLBACK');
      return next({
        log: `uploadPlaylist error: ${error?.message || error}`,
        status: 500,
        message: { err: 'Failed to upload playlist' },
      });
    }
  },

  async getSongs(req, res, next) {
    console.log('get songs called');
    try {
      const { sort, dir } = req.query;
      const result = await db.query(`SELECT track_name FROM groovin ORDER BY ${sort} ${dir}`);
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
