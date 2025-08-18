import { db } from '../db';
import { adminUsersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type AdminLoginInput, type AdminLoginResponse } from '../schema';

export async function adminLogin(input: AdminLoginInput): Promise<AdminLoginResponse> {
  try {
    // Find the admin user by username
    const users = await db.select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.username, input.username))
      .execute();

    if (users.length === 0) {
      return {
        success: false,
        message: "Invalid credentials"
      };
    }

    const user = users[0];

    // Verify password using Bun's built-in password verification
    const isValidPassword = await Bun.password.verify(input.password, user.password_hash);

    if (!isValidPassword) {
      return {
        success: false,
        message: "Invalid credentials"
      };
    }

    // Generate a simple JWT-like token (in production, use a proper JWT library)
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    return {
      success: true,
      token: token,
      message: "Login successful"
    };

  } catch (error) {
    console.error('Admin login failed:', error);
    throw error;
  }
}