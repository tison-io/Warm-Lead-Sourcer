declare module 'sib-api-v3-sdk' {
  export class ApiClient {
    static instance: ApiClient;
    authentications: {
      'api-key': { apiKey: string };
    };
  }

  export class TransactionalEmailsApi {
    constructor();
    setApiKey(type: number, key: string): void;
    sendTransacEmail(emailData: any): Promise<any>;
  }

  export class SendSmtpEmail {
    constructor();
    subject?: string;
    htmlContent?: string;
    sender?: { name?: string; email?: string };
    to?: Array<{ email?: string; name?: string }>;
    params?: Record<string, any>;
  }
}
