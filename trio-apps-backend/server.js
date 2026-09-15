import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// CONFIGURATION
// =====================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// Simple JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// =====================
// HEALTH CHECK
// =====================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// =====================
// AUTHENTICATION ENDPOINTS
// =====================

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: uuidv4(),
        email,
        username,
        password: hashedPassword,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      user: { id: user.id, email: user.email, username: user.username },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// QUOTE ENDPOINTS
// =====================

// Get random quote
app.get('/api/quote/random', async (req, res) => {
  try {
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*');

    if (error) throw error;

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json(randomQuote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get daily quote (same for everyone on same day)
app.get('/api/quote/daily', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: dailyQuote, error } = await supabase
      .from('daily_quotes')
      .select('quote:quotes(*)')
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!dailyQuote) {
      const { data: quotes } = await supabase
        .from('quotes')
        .select('*');
      
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      
      await supabase
        .from('daily_quotes')
        .insert({ date: today, quote_id: randomQuote.id });

      return res.json(randomQuote);
    }

    res.json(dailyQuote.quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add favorite quote
app.post('/api/quote/favorite', verifyToken, async (req, res) => {
  try {
    const { quoteId } = req.body;

    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        id: uuidv4(),
        user_id: req.userId,
        quote_id: quoteId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user favorites
app.get('/api/user/favorites', verifyToken, async (req, res) => {
  try {
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select('quote:quotes(*)')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(favorites.map(f => f.quote));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// MEME ENDPOINTS
// =====================

// Get random meme
app.get('/api/meme/random', async (req, res) => {
  try {
    const { data: memes, error } = await supabase
      .from('memes')
      .select('*');

    if (error) throw error;

    const randomMeme = memes[Math.floor(Math.random() * memes.length)];
    res.json(randomMeme);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vote on meme (upvote/downvote)
app.post('/api/meme/vote', verifyToken, async (req, res) => {
  try {
    const { memeId, voteType } = req.body; // voteType: 'up' or 'down'

    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const { data, error } = await supabase
      .from('meme_votes')
      .insert({
        id: uuidv4(),
        meme_id: memeId,
        user_id: req.userId,
        vote_type: voteType,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update meme vote counts
    const { data: meme } = await supabase
      .from('memes')
      .select('upvotes, downvotes')
      .eq('id', memeId)
      .single();

    const newUpvotes = voteType === 'up' ? (meme.upvotes || 0) + 1 : meme.upvotes || 0;
    const newDownvotes = voteType === 'down' ? (meme.downvotes || 0) + 1 : meme.downvotes || 0;

    await supabase
      .from('memes')
      .update({ upvotes: newUpvotes, downvotes: newDownvotes })
      .eq('id', memeId);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trending memes
app.get('/api/meme/trending', async (req, res) => {
  try {
    const { data: memes, error } = await supabase
      .from('memes')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json(memes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// HABIT TRACKER ENDPOINTS
// =====================

// Create habit
app.post('/api/habit', verifyToken, async (req, res) => {
  try {
    const { name, description, category } = req.body;

    const { data, error } = await supabase
      .from('habits')
      .insert({
        id: uuidv4(),
        user_id: req.userId,
        name,
        description,
        category,
        created_at: new Date().toISOString(),
        streak: 0,
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user habits
app.get('/api/user/habits', verifyToken, async (req, res) => {
  try {
    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check in habit (mark as done today)
app.post('/api/habit/checkin', verifyToken, async (req, res) => {
  try {
    const { habitId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const { data: existingCheckin } = await supabase
      .from('habit_checkins')
      .select('*')
      .eq('habit_id', habitId)
      .eq('date', today)
      .single();

    if (existingCheckin) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const { data, error } = await supabase
      .from('habit_checkins')
      .insert({
        id: uuidv4(),
        habit_id: habitId,
        date: today,
        completed: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Calculate streak
    const { data: checkins } = await supabase
      .from('habit_checkins')
      .select('date')
      .eq('habit_id', habitId)
      .order('date', { ascending: false });

    let streak = 0;
    const today_date = new Date();
    
    for (let i = 0; i < checkins.length; i++) {
      const checkInDate = new Date(checkins[i].date);
      const expectedDate = new Date(today_date);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (checkInDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    // Update habit streak
    await supabase
      .from('habits')
      .update({ streak })
      .eq('id', habitId);

    res.json({ checkin: data, streak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get habit history
app.get('/api/habit/:habitId/history', verifyToken, async (req, res) => {
  try {
    const { habitId } = req.params;

    const { data: history, error } = await supabase
      .from('habit_checkins')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: false });

    if (error) throw error;

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { data: leaderboard, error } = await supabase
      .from('habits')
      .select('user_id, users(username), streak')
      .order('streak', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// ERROR HANDLING
// =====================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});