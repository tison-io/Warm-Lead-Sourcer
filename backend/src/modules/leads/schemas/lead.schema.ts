import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  urn: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  headline: string;

  @Prop()
  profileUrl: string;

  @Prop({
    type: {
      country: String,
      city: String,
    },
  })
  location?: {
    country: string;
    city: string;
  };

  @Prop([
    {
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startYear: Number,
      endYear: Number,
    },
  ])
  education: Array<{
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    startYear?: number;
    endYear?: number;
  }>;

  @Prop([
    {
      company: String,
      title: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
    },
  ])
  experience: Array<{
    company: string;
    title: string;
    startDate?: Date;
    endDate?: Date;
    current: boolean;
  }>;

  @Prop({ required: true, enum: ['like', 'comment', 'share', 'reaction'] })
  engagementType: string;

  @Prop({ min: 0, max: 100, default: 0 })
  matchScore: number;

  @Prop()
  guessedEmail?: string;

  @Prop([String])
  tags: string[];

  @Prop({ default: false })
  exported: boolean;

  @Prop({ required: false })
  expiresAt?: Date;

  @Prop({ required: false })
  deletedAt?: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
