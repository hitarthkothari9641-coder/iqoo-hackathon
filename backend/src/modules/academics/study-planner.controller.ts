import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthGuard,
  AuthenticatedRequest,
} from '../../common/guards/auth.guard';
import { PrismaService } from '../../database/prisma.service';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateStudyTaskDto {
  subjectId?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  estimatedMinutes?: number;
  dueAt?: string;
}

export class CreateAcademicGoalDto {
  title: string;
  target: string;
  deadline?: string;
}

@ApiTags('study-planner')
@Controller('me/study')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class StudyPlannerController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'Get student study tasks' })
  async getTasks(@Req() req: AuthenticatedRequest) {
    return this.prisma.studyTask.findMany({
      where: { userId: req.user.userId },
      include: { subject: { select: { code: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create a personal study task' })
  async createTask(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateStudyTaskDto,
  ) {
    return this.prisma.studyTask.create({
      data: {
        userId: req.user.userId,
        subjectId: dto.subjectId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || TaskPriority.MEDIUM,
        estimatedMinutes: dto.estimatedMinutes || 30,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      },
    });
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update study task status' })
  async updateTask(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: { status: TaskStatus },
  ) {
    const task = await this.prisma.studyTask.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.studyTask.update({
      where: { id },
      data: {
        status: dto.status,
        completedAt: dto.status === TaskStatus.COMPLETED ? new Date() : null,
      },
    });
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get student academic goals' })
  async getGoals(@Req() req: AuthenticatedRequest) {
    return this.prisma.academicGoal.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create personal academic goal' })
  async createGoal(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAcademicGoalDto,
  ) {
    return this.prisma.academicGoal.create({
      data: {
        userId: req.user.userId,
        title: dto.title,
        target: dto.target,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
      },
    });
  }
}
