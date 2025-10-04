import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiController = {
  async handleQuery(req: Request, res: Response, next: NextFunction) {
    try {
      const { question } = req.body;
      if (!question) {
        return res
          .status(400)
          .json({ error: 'Missing question in request body' });
      }

      const match = question.match(/top\s+(\d+)/i);
      let n = match ? parseInt(match[1], 10) : 10;
      if (n > 100) n = 100;

      //fetch Billboard data
      const url =
        'https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/main/recent.json';
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Billboard fetch failed: ${response.status}`);

      const chartData = await response.json();
      let songs = chartData.data;

      //possible genre or mood keywords
      const genreKeywords = [
        'pop',
        'rock',
        'rap',
        'hip hop',
        'country',
        'sad',
        'happy',
        'love',
        'party',
        'chill',
        'dance',
        'r&b',
        'latin',
        'edm',
      ];

      // detect genre keyword
      const lowerQ = question.toLowerCase();
      const foundGenre = genreKeywords.find((kw) => lowerQ.includes(kw));

      // detect artist name (capitalize words)
      const artistRegex = question.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
      let filterKeyword = '';

      if (artistRegex) {
        const ignore = [
          'Top',
          'Songs',
          'Popular',
          'In',
          'The',
          'Chart',
          'Billboard',
          'Music',
          'Song',
        ];
        const possibleNames = artistRegex.filter(
          (word) => !ignore.includes(word)
        );
        if (possibleNames.length > 0) {
          filterKeyword = possibleNames.join(' ');
        }
      }

      //filter : artist or genre
      if (filterKeyword) {
        songs = songs.filter(
          (song: any) =>
            song.artist.toLowerCase().includes(filterKeyword.toLowerCase()) ||
            song.song.toLowerCase().includes(filterKeyword.toLowerCase())
        );
      } else if (foundGenre) {
        songs = songs.filter(
          (song: any) =>
            song.song.toLowerCase().includes(foundGenre) ||
            song.artist.toLowerCase().includes(foundGenre)
        );
      }

      if (songs.length === 0) {
        songs = chartData.data;
      }

      const topN = songs.slice(0, n);
      const chartList = topN
        .map(
          (song: any, i: number) => `${i + 1}. ${song.song} – ${song.artist}`
        )
        .join('\n');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful music assistant. 
Try to get answer from billboard top 100 first, if you cannot find it, generate it from elsewhere
Format your answer as a numbered list, one song per line.
Example:
1. Song – Artist\n
2. Song – Artist\n
`,
          },
          {
            role: 'user',
            content: `User asked: ${question}\n\nHere are the Billboard chart matches:\n${chartList}`,
          },
        ],
      });

      const aiAnswer = completion.choices[0].message?.content || 'No response';

      return res.status(200).json({
        question,
        keyword: filterKeyword || foundGenre || null,
        n,
        answer: aiAnswer,
        chart: topN,
      });
    } catch (error: any) {
      console.error('Error in openaiController.handleQuery:', error.message);
      return next({
        log: `openaiController.handleQuery: ${error.message}`,
        status: 500,
        message: { err: 'Failed to process assistant query' },
      });
    }
  },
};

export default openaiController;
