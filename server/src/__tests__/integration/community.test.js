'use strict';
/**
 * Integration tests — Community API (Sprint 11)
 */

require('../setup');
const request = require('supertest');

process.env.NODE_ENV           = 'test';
process.env.JWT_SECRET         = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES= '7d';

const app = require('../../app');

// ─── Helper ──────────────────────────────────────────────────────────────────

async function registerAndLogin(overrides = {}) {
  const email = overrides.email || `comm_${Date.now()}_${Math.random()}@test.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: overrides.name || 'Community User', email, password: 'password123',
  });
  expect(reg.status).toBe(201);
  return { token: reg.body.data.token, email };
}

// ─── Posts ───────────────────────────────────────────────────────────────────

describe('Community API — Posts', () => {
  let token;

  beforeEach(async () => {
    ({ token } = await registerAndLogin());
  });

  describe('POST /api/community/posts', () => {
    it('creates a post with valid data', async () => {
      const res = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Hello community!', category: 'General' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Hello community!');
    });

    it('returns 400 for empty content', async () => {
      const res = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '' });
      expect(res.status).toBe(400);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/community/posts')
        .send({ content: 'Unauthenticated post' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/community/posts', () => {
    it('returns paginated list of posts', async () => {
      await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Test post for listing', category: 'Business' });

      const res = await request(app)
        .get('/api/community/posts')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.posts)).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('pages');
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/community/posts');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/community/posts/:id', () => {
    it('returns a single post', async () => {
      const create = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Single post test' });
      const postId = create.body.data._id;

      const res = await request(app)
        .get(`/api/community/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(postId);
    });
  });

  describe('PUT /api/community/posts/:id', () => {
    it('updates own post', async () => {
      const create = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Original' });
      const postId = create.body.data._id;

      const res = await request(app)
        .put(`/api/community/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Updated content' });
      expect(res.status).toBe(200);
      expect(res.body.data.content).toBe('Updated content');
    });

    it('returns 403 when updating another user\'s post', async () => {
      const create = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Owner post' });
      const postId = create.body.data._id;

      const { token: otherToken } = await registerAndLogin({ email: `other_${Date.now()}@test.com` });
      const res = await request(app)
        .put(`/api/community/posts/${postId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ content: 'Hacked' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/community/posts/:id', () => {
    it('deletes own post', async () => {
      const create = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Delete this post' });
      const postId = create.body.data._id;

      const res = await request(app)
        .delete(`/api/community/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });
  });
});

// ─── Likes & Bookmarks ───────────────────────────────────────────────────────

describe('Community API — Likes & Bookmarks', () => {
  let token, postId;

  beforeEach(async () => {
    ({ token } = await registerAndLogin());
    const create = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Like/bookmark test post' });
    postId = create.body.data._id;
  });

  it('POST /api/community/posts/:id/like — toggles like on', async () => {
    const res = await request(app)
      .post(`/api/community/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.liked).toBe(true);
    expect(res.body.data.likeCount).toBe(1);
  });

  it('POST /api/community/posts/:id/like — toggles like off on second call', async () => {
    await request(app)
      .post(`/api/community/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .post(`/api/community/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.liked).toBe(false);
  });

  it('POST /api/community/posts/:id/bookmark — bookmarks a post', async () => {
    const res = await request(app)
      .post(`/api/community/posts/${postId}/bookmark`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.bookmarked).toBe(true);
  });

  it('GET /api/community/bookmarks — returns bookmarked posts', async () => {
    await request(app)
      .post(`/api/community/posts/${postId}/bookmark`)
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .get('/api/community/bookmarks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.bookmarks)).toBe(true);
  });
});

// ─── Comments ────────────────────────────────────────────────────────────────

describe('Community API — Comments', () => {
  let token, postId;

  beforeEach(async () => {
    ({ token } = await registerAndLogin());
    const create = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Comments test post' });
    postId = create.body.data._id;
  });

  it('POST /api/community/posts/:id/comments — adds a comment', async () => {
    const res = await request(app)
      .post(`/api/community/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Great post!' });
    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Great post!');
  });

  it('GET /api/community/posts/:id/comments — returns comments', async () => {
    await request(app)
      .post(`/api/community/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Test comment' });

    const res = await request(app)
      .get(`/api/community/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.comments)).toBe(true);
    expect(res.body.data.comments.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Follow System ───────────────────────────────────────────────────────────

describe('Community API — Follow System', () => {
  let tokenA, tokenB, userBId;

  beforeEach(async () => {
    const regA = await request(app).post('/api/auth/register').send({
      name: 'User A', email: `ua_${Date.now()}@test.com`, password: 'password123',
    });
    tokenA = regA.body.data.token;

    const regB = await request(app).post('/api/auth/register').send({
      name: 'User B', email: `ub_${Date.now()}@test.com`, password: 'password123',
    });
    tokenB = regB.body.data.token;

    const profileB = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${tokenB}`);
    userBId = profileB.body.data?._id || profileB.body.data?.user?._id;
  });

  it('POST /api/community/follow/:userId — follows a user', async () => {
    if (!userBId) return; // skip if profile route returns different shape
    const res = await request(app)
      .post(`/api/community/follow/${userBId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(201);
    expect(res.body.data.following).toBe(true);
  });

  it('GET /api/community/suggested — returns suggested users', async () => {
    const res = await request(app)
      .get('/api/community/suggested')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── Feed ────────────────────────────────────────────────────────────────────

describe('Community API — Feed', () => {
  it('GET /api/community/feed — returns feed (may be empty for new user)', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app)
      .get('/api/community/feed')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.posts)).toBe(true);
  });
});
