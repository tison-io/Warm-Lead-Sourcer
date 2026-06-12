import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { ScrapingModule } from './modules/scraping/scraping.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ExportModule } from './modules/export/export.module';
import { CleanupModule } from './modules/cleanup/cleanup.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),

    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL) || 60000,
        limit: Number(process.env.THROTTLE_LIMIT) || 20,
      },
    ]),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        console.log('Connecting to MongoDB...');
        if (!uri) {
          console.error('MONGODB_URI not found in environment variables');
          throw new Error('MONGODB_URI is required');
        }
        return {
          uri,
          retryWrites: true,
          retryReads: true,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 30000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 30000,
          family: 4,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              console.log('MongoDB connected successfully');
            });
            connection.on('error', (error: Error) => {
              console.error('MongoDB connection error:', error.message);
            });
            connection.on('disconnected', () => {
              console.log('MongoDB disconnected');
            });
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    PostsModule,
    ScrapingModule,
    LeadsModule,
    ExportModule,
    CleanupModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
