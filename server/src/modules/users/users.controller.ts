import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ZodValidation } from '../../common/decorators/zod-validation.decorator';
import { CreateUserSchema, SearchUsersSchema, ApiResponseSchema, UserSchema } from '../../common/schemas';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Request() req: any) {
    const user = await this.usersService.findBySub(req.user.sub);
    
    if (!user) {
      // Auto-create user if not exists
      const newUser = await this.usersService.create({
        sub: req.user.sub,
        email: req.user.email,
        name: req.user.name,
      });
      return {
        success: true,
        data: newUser,
      };
    }

    return {
      success: true,
      data: user,
    };
  }

  @Post('me')
  @UseGuards(AuthGuard)
  @ZodValidation(CreateUserSchema)
  async upsertMe(@Request() req: any, @Body() createUserDto: any) {
    const user = await this.usersService.upsertBySub(req.user.sub, createUserDto);
    return {
      success: true,
      data: user,
    };
  }

  @Get('search')
  @UseGuards(AuthGuard)
  @ZodValidation(SearchUsersSchema)
  async searchUsers(@Query() query: any) {
    const users = await this.usersService.search(query.q, query.limit);
    return {
      success: true,
      data: users,
    };
  }
}
