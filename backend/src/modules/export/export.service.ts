import { Injectable } from '@nestjs/common';
// import * as XLSX from 'xlsx';
import { Lead } from '../leads/schemas/lead.schema';

interface ExportData {
  Name: string;
  Headline: string;
  'Profile URL': string;
  'Engagement Type': string;
  'Comment/Engagement': string;
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
    const data = this.formatLeadsForExport(leads);

    if (data.length === 0) {
      return 'No data to export';
    }

    // Create CSV headers
    const headers = Object.keys(data[0]).join(',');

    // Create CSV rows
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => {
          if (typeof value === 'string') {
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (
              value.includes(',') ||
              value.includes('"') ||
              value.includes('\n')
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
          }
          return value;
        })
        .join(','),
    );

    return [headers, ...rows].join('\n');
  }

  exportToXLSX(leads: Lead[]): string {
    // For now, return CSV format (can be opened in Excel)
    return this.exportToCSV(leads);
  }

  private formatLeadsForExport(leads: Lead[]): ExportData[] {
    return leads.map((lead) => ({
      Name: lead.name,
      Headline: lead.headline || '',
      'Profile URL': lead.profileUrl || '',
      'Engagement Type': lead.engagementType,
      'Comment/Engagement': (lead as any).engagementContent || '',
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
