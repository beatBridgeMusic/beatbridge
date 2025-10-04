import db from '../models/songsDatabaseModel';
import { Request, Response, NextFunction } from 'express';

interface PlaylistRow {
  'Track URI': string;
  [key: string]: any; // for other properties
}

function extractTrackUris(rows: PlaylistRow[]): string[] {
  return rows.map((row) => row['Track URI']);
}

interface SongsController {
  getPlaylists(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPlaylistTracks(req: Request, res: Response, next: NextFunction): Promise<void>;
  uploadPlaylist(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSongs(req: Request, res: Response, next: NextFunction): Promise<void>;
  getDemoSongs(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllTrackNames(req: Request, res: Response, next: NextFunction): Promise<void>;
}

async function createPlaylist(userId: string, playlistName: string): Promise<string> {
  console.log(`Creating playlist "${playlistName}" for user ${userId}`);
  const result = await db.query(
    `INSERT INTO playlists (user_id, name)
     VALUES ($1, $2)
     RETURNING id`,
    [userId, playlistName]
  );

  const playlistId = result.rows[0].id;
  console.log(`Created playlist with ID: ${playlistId}`);
  return playlistId;
}

async function linkTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
  console.log(`Linking ${trackUris.length} tracks to playlist ${playlistId}`);

  // Using a transaction to ensure all tracks are linked
  await db.query('BEGIN');

  try {
    for (let i = 0; i < trackUris.length; i++) {
      await db.query(
        `INSERT INTO playlist_tracks (playlist_id, track_uri, position)
         VALUES ($1, $2, $3)`,
        [playlistId, trackUris[i], i]
      );
    }

    await db.query('COMMIT');
    console.log('Successfully linked all tracks to playlist');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error linking tracks to playlist:', error);
    throw error;
  }
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
  // TODO: should probablt split this up into uploadTracks, createPlaylist, linkTracksToPlaylist
  // TODO: use the JWT (session token) from supabase that already gets fed into upload playlist
  // Add a tiny auth middleware that
  // 1. reads the Authorization header
  // 2. extracts the bearer token
  // 3. asks Supabase to tell you which user it belongs to,
  // 4. puts that user on req.user.
  // And then use req.user.id in your controllers instead of trusting req.body.userId
  async uploadPlaylist(req, res, next) {
    try {
      const { playlistName, rows, userId } = req.body;

      if (!userId) {
        return next({
          log: 'uploadPlaylist: missing userId',
          status: 401,
          message: { err: 'Unauthorized: userId not found' },
        });
      }

      if (!Array.isArray(rows) || rows.length === 0) {
        return next({
          log: 'uploadPlaylist: no rows',
          status: 400,
          message: { err: 'No rows provided' },
        });
      }

      if (!playlistName || playlistName === '') {
        return next({
          log: 'uploadPlaylist: missing playlist name',
          status: 400,
          message: { err: 'Missing playlist name' },
        });
      }

      // Start transaction
      await db.query('BEGIN');

      try {
        console.log(`Processing ${rows.length} songs for playlist "${playlistName}"`);

        // Transform and validate the data
        const transformedRows = rows.map((row) => ({
          track_uri: row['Track URI'],
          track_name: row['Track Name'],
          album_name: row['Album Name'],
          artist_names: row['Artist Name(s)'],
          release_date: row['Release Date'],
          duration_ms: row['Duration (ms)'],
          popularity: row['Popularity'],
          explicit: row['Explicit'],
          added_by: row['Added By'],
          added_at: row['Added At'],
          genres: row['Genres'],
          record_label: row['Record Label'],
          danceability: row['Danceability'],
          energy: row['Energy'],
          key: row['Key'],
          loudness: row['Loudness'],
          mode: row['Mode'],
          speechiness: row['Speechiness'],
          acousticness: row['Acousticness'],
          instrumentalness: row['Instrumentalness'],
          liveness: row['Liveness'],
          valence: row['Valence'],
          tempo: row['Tempo'],
          time_signature: row['Time Signature'],
        }));

        // Insert songs into the songs table
        for (const [index, song] of transformedRows.entries()) {
          const query = `
            INSERT INTO tracks (
              track_uri, track_name, album_name, artist_names, release_date, duration_ms, 
              popularity, explicit, added_by, added_at, genres, record_label,
              danceability, energy, key, loudness, mode, speechiness, acousticness, 
              instrumentalness, liveness, valence, tempo, time_signature
            )
            VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
              $21, $22, $23, $24
            )
            ON CONFLICT (track_uri)
            DO UPDATE SET
              track_name = EXCLUDED.track_name,
              album_name = EXCLUDED.album_name,
              artist_names = EXCLUDED.artist_names,
              release_date = EXCLUDED.release_date,
              duration_ms = EXCLUDED.duration_ms,
              popularity = EXCLUDED.popularity,
              explicit = EXCLUDED.explicit,
              added_by = EXCLUDED.added_by,
              added_at = EXCLUDED.added_at,
              genres = EXCLUDED.genres,
              record_label = EXCLUDED.record_label,
              danceability = EXCLUDED.danceability,
              energy = EXCLUDED.energy,
              key = EXCLUDED.key,
              loudness = EXCLUDED.loudness,
              mode = EXCLUDED.mode,
              speechiness = EXCLUDED.speechiness,
              acousticness = EXCLUDED.acousticness,
              instrumentalness = EXCLUDED.instrumentalness,
              liveness = EXCLUDED.liveness,
              valence = EXCLUDED.valence,
              tempo = EXCLUDED.tempo,
              time_signature = EXCLUDED.time_signature;
          `;

          const values = [
            song.track_uri,
            song.track_name,
            song.album_name,
            song.artist_names,
            song.release_date,
            song.duration_ms,
            song.popularity,
            song.explicit,
            song.added_by,
            song.added_at,
            song.genres,
            song.record_label,
            song.danceability,
            song.energy,
            song.key,
            song.loudness,
            song.mode,
            song.speechiness,
            song.acousticness,
            song.instrumentalness,
            song.liveness,
            song.valence,
            song.tempo,
            song.time_signature,
          ];

          // console.log(`Upserting song ${index + 1}/${rows.length}: ${song.track_name}`);
          await db.query(query, values);
        }

        await db.query('COMMIT');
        console.log('Successfully committed all songs to database');

        res.locals.uploadResult = {
          success: true,
          rowsInserted: rows.length,
          playlistName,
        };

        // create playlist and tie the playlist to the tracks (only after upserting the tracks)
        try {
          // helper function of creating playlist in playlists table. return the generated uuid as playlistId
          const playlistId = await createPlaylist(userId, playlistName);
          // helper function to add to playlist_tracks table
          const trackUris = extractTrackUris(rows); // This is synchronous, no await needed
          await linkTracksToPlaylist(playlistId, trackUris);

          await db.query('COMMIT');
        } catch (error) {
          await db.query('ROLLBACK');
          throw error;
        }

        return next();
      } catch (error) {
        console.error('Error during transaction:', error);
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error: any) {
      console.error('Error in uploadPlaylist:', error);
      return next({
        log: `uploadPlaylist error: ${error?.message || error}`,
        status: 500,
        message: { err: 'Failed to upload playlist' },
      });
    }
  },

  async getPlaylists(req, res, next) {
    console.log('get playlists called');
    try {
      const userId = req.params.userId;
      if (!userId) {
        return next({
          log: 'getPlaylists: missing userId',
          status: 400,
          message: { err: 'Missing userId parameter' },
        });
      }

      const { rows } = await db.query(
        `
      SELECT
        p.id,
        p.name,
        p.created_at,
        COALESCE(COUNT(pt.track_uri), 0)::int AS track_count
      FROM public.playlists AS p
      LEFT JOIN public.playlist_tracks AS pt
        ON pt.playlist_id = p.id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY COALESCE(p.created_at) DESC, p.name ASC;
      `,
        [userId]
      );
      res.locals.playlists = rows;
      return next();
    } catch (error) {
      return next({
        log: 'error in getPlaylists function',
        status: 500,
        message: { err: error.message },
      });
    }
  },

  async getPlaylistTracks(req, res, next) {
    console.log('get playlist tracks called');
    try {
      const result = await db.query(
        `SELECT
        t.*,
        pt.position AS playlist_position
        FROM public.playlist_tracks AS pt
        JOIN public.tracks AS t
        ON t.track_uri = pt.track_uri
        WHERE pt.playlist_id = $1::uuid
        ORDER BY pt.position ASC;
        `,
        [req.params.playlistId]
      );
      res.locals.playlistTracks = result.rows;
      return next();
    } catch (error) {
      return next({
        log: 'error in getPlaylistTracks function',
        status: 500,
        message: { err: error.message },
      });
    }
  },

  async getSongs(req, res, next) {
    console.log('get songs called');
    try {
      const { sort, dir } = req.query;
      const result = await db.query(`SELECT track_name FROM groovin ORDER BY ${sort} ${dir}`);
      res.locals.songsList = result.rows;
      return next();
    } catch (error) {
      return next({
        log: 'error in getAllSongs function',
        status: 500,
        message: { err: error.message },
      });
    }
  },

  async getDemoSongs(req, res, next) {
    console.log('get demo songs called');
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
