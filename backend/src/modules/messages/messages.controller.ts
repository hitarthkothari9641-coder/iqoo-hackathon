import {
  Controller,
  Get,
  Post,
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
import { PrismaService } from '../../database/prisma.service';

export class SendMessageDto {
  recipientUserId: string;
  content: string;
}

@ApiTags('messages')
@Controller('messages')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'List student conversations' })
  async getConversations(@Req() req: AuthenticatedRequest) {
    return this.prisma.conversationMember.findMany({
      where: { userId: req.user.userId },
      include: {
        conversation: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    displayName: true,
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Send direct message (with block checks)' })
  async sendMessage(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SendMessageDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    // Block check
    const isBlocked = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: req.user.userId, blockedId: dto.recipientUserId },
          { blockerId: dto.recipientUserId, blockedId: req.user.userId },
        ],
      },
    });

    if (isBlocked) {
      throw new ForbiddenException('Cannot send messages to blocked users.');
    }

    // Find existing direct conversation or create new
    const conversationMember = await this.prisma.conversationMember.findFirst({
      where: {
        userId: req.user.userId,
        conversation: {
          members: {
            some: { userId: dto.recipientUserId },
          },
        },
      },
    });

    let conversationId: string;

    if (conversationMember) {
      conversationId = conversationMember.conversationId;
    } else {
      const newConv = await this.prisma.conversation.create({
        data: {
          institutionId: req.user.institutionId,
        },
      });
      conversationId = newConv.id;

      await this.prisma.conversationMember.createMany({
        data: [
          { conversationId, userId: req.user.userId },
          { conversationId, userId: dto.recipientUserId },
        ],
      });
    }

    return this.prisma.message.create({
      data: {
        conversationId,
        senderId: req.user.userId,
        content: dto.content,
      },
    });
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get direct messages in a conversation' })
  async getMessages(
    @Req() req: AuthenticatedRequest,
    @Param('id') conversationId: string,
  ) {
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId: req.user.userId },
      },
    });

    if (!member)
      throw new ForbiddenException('Not a member of this conversation.');

    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
