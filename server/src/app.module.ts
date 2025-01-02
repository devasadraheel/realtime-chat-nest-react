import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { UsersModule } from './modules/users/users.module';
import { JwksService } from './common/utils/jwks-client';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime-chat'),
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [JwksService],
})
export class AppModule {}
