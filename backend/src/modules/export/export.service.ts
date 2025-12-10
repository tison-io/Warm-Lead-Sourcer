import { Injectable } from '@nestjs/common';
// import * as XLSX from 'xlsx';
import { Lead } from '../leads/schemas/lead.schema';

interface ExportData {
  Name: string;
  Headline: string;
  'Profile URL': string;
  'Engagement Type': string;
  'Match Score': number;
  'Guessed Email': string;
  Country: string;
  City: string;
  University: string;
  Degree: string;
  Company: string;
  'Job Title': string;
  'Created At': string;
}

@Injectable()
export class ExportService {
  exportToCSV(leads: Lead[]): string {
    // TODO: Install xlsx package
    throw new Error('Export feature not available');
    // const data = this.formatLeadsForExport(leads);
    // const worksheet = XLSX.utils.json_to_sheet(data);
    // return XLSX.utils.sheet_to_csv(worksheet);
  }

  exportToXLSX(leads: Lead[]): Buffer {
    // TODO: Install xlsx package
    throw new Error('Export feature not available');
    // const data = this.formatLeadsForExport(leads);
    // const worksheet = XLSX.utils.json_to_sheet(data);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    // return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  private formatLeadsForExport(leads: Lead[]): ExportData[] {
    return leads.map((lead) => ({
      Name: lead.name,
      Headline: lead.headline || '',
      'Profile URL': lead.profileUrl || '',
      'Engagement Type': lead.engagementType,
      'Match Score': lead.matchScore,
      'Guessed Email': lead.guessedEmail || '',
      Country: lead.location?.country || '',
      City: lead.location?.city || '',
      University: lead.education?.[0]?.institution || '',
      Degree: lead.education?.[0]?.degree || '',
      Company: lead.experience?.[0]?.company || '',
      'Job Title': lead.experience?.[0]?.title || '',
      'Created At': new Date().toLocaleDateString(),
    }));
  }
}
