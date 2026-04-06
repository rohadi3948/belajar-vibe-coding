import { Elysia, t } from 'elysia';
import { registerUser, loginUser, getCurrentUser, logoutUser } from '../services/users-service';

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .derive(({ headers }) => {
    const authHeader = headers['authorization'];
    
    return {
      getBearerToken: () => {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new Error('Unauthorized');
        }
        return authHeader.split(' ')[1];
      }
    };
  })
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
  .get('/current', async ({ getBearerToken, set }) => {
    try {
      const token = getBearerToken();
      const user = await getCurrentUser(token);

      return { data: user };
    } catch (error: any) {
      set.status = 401;
      return { error: error.message };
    }
  })
  .delete('/logout', async ({ getBearerToken, set }) => {
    try {
      const token = getBearerToken();
      await logoutUser(token);

      return { data: 'OK' };
    } catch (error: any) {
      set.status = 401;
      return { error: error.message };
    }
  });
