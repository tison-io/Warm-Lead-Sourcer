import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true, enum: ['linkedin', 'instagram', 'twitter'] })
  platform: string;

  @Prop({ required: true })
  postId: string;

  @Prop()
  content: string;

  @Prop({
    type: {
      name: String,
      profileUrl: String,
      urn: String,
    },
  })
  author: {
    name: string;
    profileUrl: string;
    urn: string;
  };

  @Prop({
    type: {
      likesCount: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
      sharesCount: { type: Number, default: 0 },
    },
  })
  metrics: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
  };

  @Prop({ required: true })
  userId: string;

  @Prop({
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop()
  errorMessage?: string;

  @Prop()
  processedAt?: Date;

  @Prop({ default: 0 })
  totalEngagements: number;

  @Prop({ default: 0 })
  processedEngagements: number;

  @Prop({ required: false })
  expiresAt?: Date;

  @Prop({ required: false })
  deletedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
