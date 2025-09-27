import express from 'express';
import songsController from '../controllers/songsController.js';

const router = express.Router();

router.get('/', songsController.getSongs, (req, res) => {
  res.status(200).json({ songs: res.locals.songsList });
});

router.get('/', songsController.getAllSongs, (req, res) => {
  res.status(200).json({ songs: res.locals.songsList });
});

router.get('/trackNames', songsController.getAllTrackNames, (req, res) => {
  res.status(200).json({ songs: res.locals.songsList });
});

export default router;
