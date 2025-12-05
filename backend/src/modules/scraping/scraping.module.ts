import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapingService } from './scraping.service';
import { LinkedInProvider } from './providers/linkedin.provider';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { Lead, LeadSchema } from '../leads/schemas/lead.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Lead.name, schema: LeadSchema },
    ]),
  ],
  providers: [ScrapingService, LinkedInProvider],
  exports: [ScrapingService],
})
export class ScrapingModule {}
