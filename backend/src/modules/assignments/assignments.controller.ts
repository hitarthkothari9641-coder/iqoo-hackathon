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
  RequirePermission,
} from '../../common/guards/auth.guard';
import { AssignmentsService } from './assignments.service';

export class CreateAssignmentDto {
  subjectId: string;
  sectionId?: string;
  title: string;
  description: string;
  instructions?: string;
  dueAt: string;
  maxMarks?: number;
  allowLate?: boolean;
}

export class SubmitAssignmentDto {
  content?: string;
  fileUrl?: string;
}

export class GradeSubmissionDto {
  grade: number;
  feedback?: string;
}

@ApiTags('assignments')
@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get('assignments')
  @ApiOperation({ summary: 'Get student enrolled assignments' })
  async getStudentAssignments(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');
    return this.assignmentsService.getStudentAssignments(
      req.user.userId,
      req.user.institutionId,
    );
  }

  @Post('assignments/:id/submissions')
  @ApiOperation({ summary: 'Submit an assignment' })
  async submitAssignment(
    @Req() req: AuthenticatedRequest,
    @Param('id') assignmentId: string,
    @Body() dto: SubmitAssignmentDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');
    return this.assignmentsService.submitAssignment(
      {
        assignmentId,
        studentUserId: req.user.userId,
        content: dto.content,
        fileUrl: dto.fileUrl,
      },
      req.user.institutionId,
    );
  }

  @Post('faculty/assignments')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Faculty: Create assignment draft' })
  async createAssignment(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAssignmentDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');
    return this.assignmentsService.createAssignment({
      institutionId: req.user.institutionId,
      facultyUserId: req.user.userId,
      subjectId: dto.subjectId,
      sectionId: dto.sectionId,
      title: dto.title,
      description: dto.description,
      instructions: dto.instructions,
      dueAt: new Date(dto.dueAt),
      maxMarks: dto.maxMarks,
      allowLate: dto.allowLate,
    });
  }

  @Post('faculty/assignments/:id/publish')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Faculty: Publish assignment' })
  async publishAssignment(
    @Req() req: AuthenticatedRequest,
    @Param('id') assignmentId: string,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');
    return this.assignmentsService.publishAssignment(
      assignmentId,
      req.user.userId,
      req.user.institutionId,
    );
  }

  @Patch('faculty/submissions/:id/grade')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Faculty: Grade student submission' })
  async gradeSubmission(
    @Req() req: AuthenticatedRequest,
    @Param('id') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');
    return this.assignmentsService.gradeSubmission(
      {
        submissionId,
        facultyUserId: req.user.userId,
        grade: dto.grade,
        feedback: dto.feedback,
      },
      req.user.institutionId,
    );
  }
}
