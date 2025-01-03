import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from '../users/users.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => ConversationsModule),
    forwardRef(() => MessagesModule),
  ],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class WsModule {}
