import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.postsService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.postsService.findOne(id, req.user.userId);
  }

  @Post(':id/process')
  async process(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.postsService.process(id, req.user.userId);
  }
}
