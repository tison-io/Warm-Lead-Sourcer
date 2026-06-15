import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { Lead, LeadSchema } from './schemas/lead.schema';
import {
  FilterPreset,
  FilterPresetSchema,
} from './schemas/filter-preset.schema';
import { ExportService } from '../export/export.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: FilterPreset.name, schema: FilterPresetSchema },
    ]),
  ],
  controllers: [LeadsController],
  providers: [LeadsService, ExportService],
  exports: [LeadsService],
})
export class LeadsModule {}
