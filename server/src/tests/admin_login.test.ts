import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { adminUsersTable } from '../db/schema';
import { type AdminLoginInput } from '../schema';
import { adminLogin } from '../handlers/admin_login';
import { eq } from 'drizzle-orm';

const testAdminUser = {
  username: 'testadmin',
  password: 'testpassword123'
};

const testLoginInput: AdminLoginInput = {
  username: testAdminUser.username,
  password: testAdminUser.password
};

describe('adminLogin', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should login successfully with valid credentials', async () => {
    // Create test admin user with hashed password
    const passwordHash = await Bun.password.hash(testAdminUser.password);
    await db.insert(adminUsersTable)
      .values({
        username: testAdminUser.username,
        password_hash: passwordHash
      })
      .execute();

    const result = await adminLogin(testLoginInput);

    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.message).toEqual('Login successful');
    expect(typeof result.token).toBe('string');

    // Verify token contains expected data
    if (result.token) {
      const decodedToken = JSON.parse(Buffer.from(result.token, 'base64').toString());
      expect(decodedToken.username).toEqual(testAdminUser.username);
      expect(decodedToken.userId).toBeDefined();
      expect(decodedToken.iat).toBeDefined();
      expect(decodedToken.exp).toBeDefined();
      expect(decodedToken.exp > decodedToken.iat).toBe(true);
    }
  });

  it('should fail with invalid username', async () => {
    // Create test admin user
    const passwordHash = await Bun.password.hash(testAdminUser.password);
    await db.insert(adminUsersTable)
      .values({
        username: testAdminUser.username,
        password_hash: passwordHash
      })
      .execute();

    const invalidInput: AdminLoginInput = {
      username: 'nonexistentuser',
      password: testAdminUser.password
    };

    const result = await adminLogin(invalidInput);

    expect(result.success).toBe(false);
    expect(result.token).toBeUndefined();
    expect(result.message).toEqual('Invalid credentials');
  });

  it('should fail with invalid password', async () => {
    // Create test admin user
    const passwordHash = await Bun.password.hash(testAdminUser.password);
    await db.insert(adminUsersTable)
      .values({
        username: testAdminUser.username,
        password_hash: passwordHash
      })
      .execute();

    const invalidInput: AdminLoginInput = {
      username: testAdminUser.username,
      password: 'wrongpassword'
    };

    const result = await adminLogin(invalidInput);

    expect(result.success).toBe(false);
    expect(result.token).toBeUndefined();
    expect(result.message).toEqual('Invalid credentials');
  });

  it('should fail when no admin users exist', async () => {
    const result = await adminLogin(testLoginInput);

    expect(result.success).toBe(false);
    expect(result.token).toBeUndefined();
    expect(result.message).toEqual('Invalid credentials');
  });

  it('should verify user exists in database after successful login', async () => {
    // Create test admin user
    const passwordHash = await Bun.password.hash(testAdminUser.password);
    const insertResult = await db.insert(adminUsersTable)
      .values({
        username: testAdminUser.username,
        password_hash: passwordHash
      })
      .returning()
      .execute();

    const result = await adminLogin(testLoginInput);

    expect(result.success).toBe(true);

    // Verify the user still exists in database
    const users = await db.select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.username, testAdminUser.username))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].username).toEqual(testAdminUser.username);
    expect(users[0].id).toEqual(insertResult[0].id);
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple admin users correctly', async () => {
    // Create multiple admin users
    const password1Hash = await Bun.password.hash('password1');
    const password2Hash = await Bun.password.hash('password2');

    await db.insert(adminUsersTable)
      .values([
        {
          username: 'admin1',
          password_hash: password1Hash
        },
        {
          username: 'admin2',
          password_hash: password2Hash
        }
      ])
      .execute();

    // Test login for first admin
    const result1 = await adminLogin({
      username: 'admin1',
      password: 'password1'
    });

    expect(result1.success).toBe(true);
    expect(result1.token).toBeDefined();

    // Test login for second admin
    const result2 = await adminLogin({
      username: 'admin2',
      password: 'password2'
    });

    expect(result2.success).toBe(true);
    expect(result2.token).toBeDefined();

    // Verify tokens are different
    expect(result1.token).not.toEqual(result2.token);

    // Test wrong password for first admin
    const result3 = await adminLogin({
      username: 'admin1',
      password: 'password2'
    });

    expect(result3.success).toBe(false);
    expect(result3.token).toBeUndefined();
  });

  it('should handle empty input gracefully', async () => {
    // Create test admin user
    const passwordHash = await Bun.password.hash(testAdminUser.password);
    await db.insert(adminUsersTable)
      .values({
        username: testAdminUser.username,
        password_hash: passwordHash
      })
      .execute();

    const emptyInput: AdminLoginInput = {
      username: '',
      password: ''
    };

    const result = await adminLogin(emptyInput);

    expect(result.success).toBe(false);
    expect(result.token).toBeUndefined();
    expect(result.message).toEqual('Invalid credentials');
  });
});