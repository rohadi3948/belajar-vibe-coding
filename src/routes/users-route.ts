import { Elysia, t } from 'elysia';
import { registerUser, loginUser, getCurrentUser } from '../services/users-service';

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post('/', async ({ body, set }) => {
    try {
      await registerUser(body);
      return { data: 'OK' };
    } catch (error: any) {
      set.status = 400;
      return { error: error.message };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
    })
  })
  .post('/login', async ({ body, set }) => {
    try {
      const token = await loginUser(body);
      return { data: token };
    } catch (error: any) {
      set.status = 401;
      return { error: error.message };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  })
  .get('/current', async ({ headers, set }) => {
    try {
      const authHeader = headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
      }

      const token = authHeader.split(' ')[1];
      const user = await getCurrentUser(token);

      return { data: user };
    } catch (error: any) {
      set.status = 401;
      return { error: error.message };
    }
  });
