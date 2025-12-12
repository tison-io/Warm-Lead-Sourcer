import { Injectable } from '@nestjs/common';
// import * as XLSX from 'xlsx';
import { Lead } from '../leads/schemas/lead.schema';

interface ExportData {
  'Full Name': string;
  'Professional Headline': string;
  'LinkedIn Profile': string;
  'Engagement Type': string;
  'Comment/Content': string;
  'Match Score (%)': number;
  'Guessed Email': string;
  'Contact Email': string;
  'Phone Number': string;
  Website: string;
  Country: string;
  City: string;
  'University/Institution': string;
  Degree: string;
  'Field of Study': string;
  'Current Company': string;
  'Current Job Title': string;
  'Years of Experience': string;
  'Export Date': string;
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
    return leads.map((lead) => {
      // Calculate years of experience
      const yearsOfExperience = this.calculateYearsOfExperience(
        lead.experience || [],
      );

      // Clean engagement content
      const engagementContent = this.cleanEngagementContent(
        String((lead as any).engagementContent || ''),
      );

      return {
        'Full Name': lead.name || 'N/A',
        'Professional Headline': lead.headline || 'N/A',
        'LinkedIn Profile': lead.profileUrl || 'N/A',
        'Engagement Type': this.formatEngagementType(lead.engagementType),
        'Comment/Content': engagementContent,
        'Match Score (%)': lead.matchScore || 0,
        'Guessed Email': lead.guessedEmail || 'N/A',
        'Contact Email': (lead as any).contactInfo?.email || 'N/A',
        'Phone Number': (lead as any).contactInfo?.phone || 'N/A',
        Website: (lead as any).contactInfo?.website || 'N/A',
        Country: lead.location?.country || 'N/A',
        City: lead.location?.city || 'N/A',
        'University/Institution': lead.education?.[0]?.institution || 'N/A',
        Degree: lead.education?.[0]?.degree || 'N/A',
        'Field of Study': lead.education?.[0]?.fieldOfStudy || 'N/A',
        'Current Company': lead.experience?.[0]?.company || 'N/A',
        'Current Job Title': lead.experience?.[0]?.title || 'N/A',
        'Years of Experience': yearsOfExperience,
        'Export Date': new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    });
  }

  private formatEngagementType(type: string): string {
    const typeMap: Record<string, string> = {
      comment: 'Comment',
      like: 'Like/Reaction',
      share: 'Share/Repost',
      reaction: 'Reaction',
    };
    return typeMap[type] || type;
  }

  private cleanEngagementContent(content: string): string {
    if (!content) return 'N/A';

    // Remove extra whitespace and newlines
    const cleaned = content.replace(/\s+/g, ' ').trim();

    // Truncate if too long
    if (cleaned.length > 200) {
      return cleaned.substring(0, 197) + '...';
    }

    return cleaned || 'N/A';
  }

  private calculateYearsOfExperience(experience: any[]): string {
    if (!experience || experience.length === 0) return 'N/A';

    let totalYears = 0;
    const currentYear = new Date().getFullYear();

    experience.forEach((exp) => {
      if (exp.startYear) {
        const endYear = exp.endYear || currentYear;
        totalYears += Math.max(0, endYear - exp.startYear);
      }
    });

    if (totalYears === 0) return 'N/A';
    return totalYears === 1 ? '1 year' : `${totalYears} years`;
  }
}
