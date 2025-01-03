import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { UsersModule } from './modules/users/users.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { WsModule } from './modules/ws/ws.module';
import { JwksService } from './common/utils/jwks-client';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime-chat'),
    UsersModule,
    ConversationsModule,
    MessagesModule,
    WsModule,
  ],
  controllers: [HealthController],
  providers: [JwksService],
})
export class AppModule {}
