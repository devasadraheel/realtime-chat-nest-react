import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  Query 
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ZodValidation } from '../../common/decorators/zod-validation.decorator';
import { 
  CreateMessageSchema, 
  MarkReadSchema,
  PaginationSchema,
  ApiResponseSchema,
  PaginatedResponseSchema
} from '../../common/schemas';

@Controller('conversations/:conversationId/messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ZodValidation(CreateMessageSchema)
  async create(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
    @Body() createMessageDto: any
  ) {
    const message = await this.messagesService.create(
      conversationId,
      req.user.sub,
      createMessageDto
    );
    
    return {
      success: true,
      data: message,
    };
  }

  @Get()
  @ZodValidation(PaginationSchema)
  async findAll(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
    @Query() pagination: any
  ) {
    const result = await this.messagesService.findAll(
      conversationId,
      req.user.sub,
      pagination
    );
    
    return {
      success: true,
      data: result.messages,
      pagination: {
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      },
    };
  }

  @Post('read')
  @ZodValidation(MarkReadSchema)
  async markAsRead(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
    @Body() markReadDto: any
  ) {
    await this.messagesService.markAsRead(
      conversationId,
      req.user.sub,
      markReadDto
    );
    
    return {
      success: true,
      message: 'Messages marked as read',
    };
  }

  @Get('unread-count')
  async getUnreadCount(
    @Param('conversationId') conversationId: string,
    @Request() req: any
  ) {
    const count = await this.messagesService.getUnreadCount(
      conversationId,
      req.user.sub
    );
    
    return {
      success: true,
      data: { count },
    };
  }
}
