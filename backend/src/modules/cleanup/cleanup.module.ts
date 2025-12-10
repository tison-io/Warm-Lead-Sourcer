import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CleanupService } from './cleanup.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Lead, LeadSchema } from '../leads/schemas/lead.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Lead.name, schema: LeadSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  providers: [CleanupService],
  exports: [CleanupService],
})
export class CleanupModule {}
