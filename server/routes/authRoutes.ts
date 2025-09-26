import { Router, Request, Response } from 'express';
import { supabaseAdmin, supabaseAnon } from '../supabaseClient';

const router = Router();
// 'http://localhost:3001/auth/register'
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    //creating user in auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      return res
        .status(400)
        .json({ error: error?.message || 'Registration failed' });
    }

    const userId = data.user?.id;
    //create profile row
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: userId, username });
    if (profileError)
      return res.status(400).json({ error: profileError.message });
    res.status(200).json({ user: data.user });
  } catch (err) {
    console.error('failed to register user:', err);
    res.status(500).json({ error: `Server error` });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return res
        .status(400)
        .json({ error: error?.message || 'Invalid credentials' });
    }
    res.status(200).json({ user: data.user, session: data.session });
  } catch (err) {
    console.error('failed to login user:', err);
    res.status(500).json({ error: `Server error` });
  }
});

router.get('/login/google', async (req: Request, res: Response) => {
  const { data, error } = await supabaseAnon.auth.signInWithOAuth({
    provider: 'google',
    options: {
      //this will be directed to our main page, righ now it will be just empty Home page from frontend
      redirectTo: 'http://localhost:5173/',
    },
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  // Supabase gives you the OAuth URL → redirect user there
  res.redirect(data.url);
});
export default router;
