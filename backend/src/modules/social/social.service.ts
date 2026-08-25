import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PostType, PostVisibility } from '@prisma/client';

export interface CreatePostOptions {
  institutionId: string;
  authorId: string;
  type?: PostType;
  content: string;
  visibility?: PostVisibility;
  communityId?: string;
  clubId?: string;
  eventId?: string;
}

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async getOwnProfile(userId: string, _institutionId: string) {
    let profile = await this.prisma.socialProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.socialProfile.create({
        data: { userId },
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        email: true,
        studentProfile: {
          include: { department: true, program: true, section: true },
        },
        facultyProfile: {
          include: { department: true },
        },
      },
    });

    return { profile, user };
  }

  async updateOwnProfile(
    userId: string,
    data: {
      bio?: string;
      avatarUrl?: string;
      coverUrl?: string;
      interests?: string[];
    },
  ) {
    return this.prisma.socialProfile.upsert({
      where: { userId },
      update: {
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        coverUrl: data.coverUrl,
        interests: data.interests,
      },
      create: {
        userId,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        coverUrl: data.coverUrl,
        interests: data.interests,
      },
    });
  }

  async getUserProfile(
    targetUserId: string,
    viewerUserId: string,
    _institutionId: string,
  ) {
    // Check if target is blocked by viewer or vice versa
    const isBlocked = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: viewerUserId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: viewerUserId },
        ],
      },
    });

    if (isBlocked) {
      throw new ForbiddenException('Profile unavailable');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        studentProfile: {
          select: {
            admissionYear: true,
            currentSemester: true,
            department: { select: { name: true } },
            program: { select: { name: true } },
          },
        },
        facultyProfile: {
          select: { designation: true, department: { select: { name: true } } },
        },
        socialProfile: true,
      },
    });

    if (!targetUser) throw new NotFoundException('User profile not found');

    const followersCount = await this.prisma.follow.count({
      where: { followingId: targetUserId },
    });
    const followingCount = await this.prisma.follow.count({
      where: { followerId: targetUserId },
    });

    return { user: targetUser, stats: { followersCount, followingCount } };
  }

  async createPost(options: CreatePostOptions) {
    const post = await this.prisma.post.create({
      data: {
        institutionId: options.institutionId,
        authorId: options.authorId,
        type: options.type || PostType.TEXT,
        content: options.content,
        visibility: options.visibility || PostVisibility.COLLEGE,
        communityId: options.communityId,
        clubId: options.clubId,
        eventId: options.eventId,
      },
    });

    return post;
  }

  async getCollegeFeed(viewerUserId: string, institutionId: string) {
    // Exclude posts by blocked users
    const blocks = await this.prisma.block.findMany({
      where: {
        OR: [{ blockerId: viewerUserId }, { blockedId: viewerUserId }],
      },
    });

    const blockedUserIds = blocks.map((b) =>
      b.blockerId === viewerUserId ? b.blockedId : b.blockerId,
    );

    const posts = await this.prisma.post.findMany({
      where: {
        institutionId,
        authorId: { notIn: blockedUserIds },
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            profileImageUrl: true,
          },
        },
        media: true,
        likes: {
          where: { userId: viewerUserId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return posts.map((p) => ({
      ...p,
      isLikedByMe: p.likes.length > 0,
    }));
  }

  async toggleLike(postId: string, userId: string) {
    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.postLike.delete({ where: { id: existing.id } });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      await this.prisma.postLike.create({
        data: { postId, userId },
      });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });
      return { liked: true };
    }
  }

  async addComment(
    postId: string,
    authorId: string,
    content: string,
    parentCommentId?: string,
  ) {
    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId,
        content,
        parentCommentId,
      },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    return comment;
  }

  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId, parentCommentId: null },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                displayName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
