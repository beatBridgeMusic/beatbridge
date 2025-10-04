import express from 'express';
import songsController from '../controllers/songsController.js';

const router = express.Router();

router.get('/', songsController.getSongs, (req, res) => {
  res.status(200).json(res.locals.songsList);
});

router.get('/playlists/:userId', songsController.getPlaylists, (req, res) => {
  res.status(200).json(res.locals.playlists);
});

router.get('/demo', songsController.getDemoSongs, (req, res) => {
  res.status(200).json(res.locals.songsList);
});

router.get('/trackNames', songsController.getAllTrackNames, (req, res) => {
  res.status(200).json(res.locals.songsList);
});

router.post('/upload', songsController.uploadPlaylist, (req, res) => {
  res.status(201).json(res.locals.uploadResult);
});

export default router;
