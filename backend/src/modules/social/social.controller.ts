import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthGuard,
  AuthenticatedRequest,
} from '../../common/guards/auth.guard';
import { SocialService } from './social.service';
import { PostType, PostVisibility } from '@prisma/client';

export class UpdateProfileDto {
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  interests?: string[];
}

export class CreatePostDto {
  type?: PostType;
  content: string;
  visibility?: PostVisibility;
  communityId?: string;
  clubId?: string;
  eventId?: string;
}

export class AddCommentDto {
  content: string;
  parentCommentId?: string;
}

@ApiTags('social')
@Controller('social')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user social profile' })
  async getOwnProfile(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');
    return this.socialService.getOwnProfile(
      req.user.userId,
      req.user.institutionId,
    );
  }

  @Patch('profile/me')
  @ApiOperation({ summary: 'Update current user social profile' })
  async updateOwnProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.socialService.updateOwnProfile(req.user.userId, dto);
  }

  @Get('profile/:userId')
  @ApiOperation({ summary: 'Get target user social profile' })
  async getUserProfile(
    @Req() req: AuthenticatedRequest,
    @Param('userId') targetUserId: string,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');
    return this.socialService.getUserProfile(
      targetUserId,
      req.user.userId,
      req.user.institutionId,
    );
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get college-bound social feed' })
  async getCollegeFeed(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');
    return this.socialService.getCollegeFeed(
      req.user.userId,
      req.user.institutionId,
    );
  }

  @Post('posts')
  @ApiOperation({ summary: 'Create social post' })
  async createPost(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePostDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');
    return this.socialService.createPost({
      institutionId: req.user.institutionId,
      authorId: req.user.userId,
      type: dto.type,
      content: dto.content,
      visibility: dto.visibility,
      communityId: dto.communityId,
      clubId: dto.clubId,
      eventId: dto.eventId,
    });
  }

  @Post('posts/:id/like')
  @ApiOperation({ summary: 'Toggle post like' })
  async toggleLike(
    @Req() req: AuthenticatedRequest,
    @Param('id') postId: string,
  ) {
    return this.socialService.toggleLike(postId, req.user.userId);
  }

  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Add comment or reply' })
  async addComment(
    @Req() req: AuthenticatedRequest,
    @Param('id') postId: string,
    @Body() dto: AddCommentDto,
  ) {
    return this.socialService.addComment(
      postId,
      req.user.userId,
      dto.content,
      dto.parentCommentId,
    );
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Get post comments & threaded replies' })
  async getComments(@Param('id') postId: string) {
    return this.socialService.getComments(postId);
  }
}
