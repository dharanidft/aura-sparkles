declare module "nodemailer" {
  export interface SendMailOptions {
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
    html?: string;
    [key: string]: any;
  }

  export interface Transporter {
    sendMail(mailOptions: SendMailOptions): Promise<any>;
    [key: string]: any;
  }

  export function createTransport(options: any): Transporter;

  const nodemailer: {
    createTransport(options: any): Transporter;
  };

  export default nodemailer;
}
