import mysql from 'mysql2/promise';
import Redis from 'ioredis';
import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

const EMAIL_PATTERN = /^test-\d+@motionlab\.com$/;

async function globalTeardown() {
  const dbConfig = {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? 'Jungho!995',
    database: process.env.DB_DATABASE ?? 'motionlab',
  };
  const mongoUrl = process.env.MONGO_URL ?? 'mongodb://localhost:27017/motionlab';
  const redisHost = process.env.REDIS_HOST ?? '127.0.0.1';
  const redisPort = Number(process.env.REDIS_PORT ?? 6379);
  const uploadDir = process.env.UPLOAD_DIR ?? path.join(__dirname, '../../motionlab-server/uploads');

  // --- MySQL cleanup ---
  let connection: mysql.Connection | undefined;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Find all test users matching pattern
    const [users] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT id, email FROM users WHERE email REGEXP ?',
      ['^test-[0-9]+@motionlab\\.com$'],
    );

    if (users.length > 0) {
      const userIds = users.map((u) => u.id);
      const placeholders = userIds.map(() => '?').join(',');

      // Find video keys before deletion (for local file cleanup)
      const [motions] = await connection.execute<mysql.RowDataPacket[]>(
        `SELECT id, video_key FROM motions WHERE user_id IN (${placeholders}) AND video_key IS NOT NULL`,
        userIds,
      );

      // Delete motions
      await connection.execute(
        `DELETE FROM motions WHERE user_id IN (${placeholders})`,
        userIds,
      );

      // Delete users
      await connection.execute(
        `DELETE FROM users WHERE id IN (${placeholders})`,
        userIds,
      );

      console.log(`[teardown] MySQL: removed ${users.length} test user(s), ${motions.length} motion(s)`);

      // Redis cleanup
      let redis: Redis | undefined;
      try {
        redis = new Redis({ host: redisHost, port: redisPort, lazyConnect: true });
        await redis.connect();
        for (const userId of userIds) {
          await redis.del(`refresh_token:${userId}`);
        }
        // Also clean motion checkpoints
        for (const motion of motions as mysql.RowDataPacket[]) {
          await redis.del(`motion:checkpoint:${motion.id}`);
        }
        console.log(`[teardown] Redis: removed refresh tokens for ${userIds.length} user(s)`);
      } catch (e) {
        console.warn('[teardown] Redis cleanup failed (non-fatal):', (e as Error).message);
      } finally {
        await redis?.quit();
      }

      // MongoDB cleanup
      let mongoClient: MongoClient | undefined;
      try {
        mongoClient = new MongoClient(mongoUrl);
        await mongoClient.connect();
        const db = mongoClient.db();
        const motionIds = (motions as mysql.RowDataPacket[]).map((m) => m.id);
        if (motionIds.length > 0) {
          const result = await db.collection('analysis_results').deleteMany({
            motionId: { $in: motionIds },
          });
          console.log(`[teardown] MongoDB: removed ${result.deletedCount} analysis result(s)`);
        }
      } catch (e) {
        console.warn('[teardown] MongoDB cleanup failed (non-fatal):', (e as Error).message);
      } finally {
        await mongoClient?.close();
      }

      // Local file cleanup
      for (const motion of motions as mysql.RowDataPacket[]) {
        if (motion.video_key) {
          const filePath = path.join(uploadDir, motion.video_key);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
      if ((motions as mysql.RowDataPacket[]).length > 0) {
        console.log(`[teardown] Local uploads: cleaned ${(motions as mysql.RowDataPacket[]).length} file(s)`);
      }
    } else {
      console.log('[teardown] No test users found — nothing to clean');
    }
  } catch (e) {
    console.warn('[teardown] MySQL cleanup failed (non-fatal):', (e as Error).message);
  } finally {
    await connection?.end();
  }
}

export default globalTeardown;
