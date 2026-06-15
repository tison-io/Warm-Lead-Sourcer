import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FilterPresetDocument = FilterPreset & Document;

@Schema({ timestamps: true })
export class FilterPreset {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, maxlength: 50 })
  name!: string;

  @Prop({ type: Object, required: true })
  filters!: Record<string, any>;
}

export const FilterPresetSchema = SchemaFactory.createForClass(FilterPreset);

FilterPresetSchema.index({ userId: 1, name: 1 }, { unique: true });
