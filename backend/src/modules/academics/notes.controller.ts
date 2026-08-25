import {
  Controller,
  Get,
  Post,
  Delete,
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

export class CreateNoteDto {
  subjectId?: string;
  title: string;
  content: string;
}

@ApiTags('academic-notes')
@Controller('me/academic-notes')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get private academic notes' })
  async getNotes(@Req() req: AuthenticatedRequest) {
    return this.prisma.academicNote.findMany({
      where: { userId: req.user.userId },
      include: { subject: { select: { code: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create private academic note' })
  async createNote(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateNoteDto,
  ) {
    return this.prisma.academicNote.create({
      data: {
        userId: req.user.userId,
        subjectId: dto.subjectId,
        title: dto.title,
        content: dto.content,
      },
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete private academic note' })
  async deleteNote(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const note = await this.prisma.academicNote.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!note) throw new NotFoundException('Note not found');

    await this.prisma.academicNote.delete({ where: { id } });
    return { message: 'Note deleted successfully' };
  }
}
