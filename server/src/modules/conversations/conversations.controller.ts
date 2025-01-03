import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  UseGuards, 
  Request, 
  Query 
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ZodValidation } from '../../common/decorators/zod-validation.decorator';
import { 
  CreatePrivateConversationSchema, 
  CreateGroupConversationSchema, 
  UpdateConversationSchema,
  ApiResponseSchema,
  PaginatedResponseSchema,
  UserSchema
} from '../../common/schemas';

@Controller('conversations')
@UseGuards(AuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('private')
  @ZodValidation(CreatePrivateConversationSchema)
  async createPrivate(@Request() req: any, @Body() createPrivateDto: any) {
    const conversation = await this.conversationsService.createPrivate(
      req.user.sub,
      createPrivateDto.userId
    );
    
    return {
      success: true,
      data: conversation,
    };
  }

  @Post('group')
  @ZodValidation(CreateGroupConversationSchema)
  async createGroup(@Request() req: any, @Body() createGroupDto: any) {
    const conversation = await this.conversationsService.createGroup(
      createGroupDto.name,
      req.user.sub,
      createGroupDto.participantIds
    );
    
    return {
      success: true,
      data: conversation,
    };
  }

  @Get()
  async findAll(@Request() req: any) {
    const conversations = await this.conversationsService.findAll(req.user.sub);
    
    // Add unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await this.conversationsService.getUnreadCount(
          (conversation as any)._id.toString(),
          req.user.sub
        );
        return {
          ...(conversation as any).toObject(),
          unreadCount,
        };
      })
    );
    
    return {
      success: true,
      data: conversationsWithUnread,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const conversation = await this.conversationsService.findOne(id, req.user.sub);
    
    const unreadCount = await this.conversationsService.getUnreadCount(id, req.user.sub);
    
    return {
      success: true,
      data: {
        ...(conversation as any).toObject(),
        unreadCount,
      },
    };
  }

  @Patch(':id')
  @ZodValidation(UpdateConversationSchema)
  async update(
    @Param('id') id: string, 
    @Request() req: any, 
    @Body() updateConversationDto: any
  ) {
    const conversation = await this.conversationsService.update(
      id,
      req.user.sub,
      updateConversationDto
    );
    
    return {
      success: true,
      data: conversation,
    };
  }
}
