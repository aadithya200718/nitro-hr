import { Injectable } from '@nitrostack/core';
import nodemailer from 'nodemailer';

/**
 * Email Service
 *
 * Handles all outgoing email notifications via SMTP (nodemailer).
 * Gracefully falls back to console logging when SMTP credentials
 * are not configured (dev mode).
 */
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private senderEmail: string;

  constructor() {
    this.senderEmail = process.env.SENDER_EMAIL || 'hr-assistant@company.com';

    if (process.env.SENDER_EMAIL && process.env.SENDER_EMAIL_PWD) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SENDER_EMAIL,
          pass: process.env.SENDER_EMAIL_PWD,
        },
      });
    }
  }

  /**
   * Send an email. If SMTP is not configured, logs to console.
   */
  async send(to: string, subject: string, html: string): Promise<{ sent: boolean; message: string }> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.senderEmail,
          to,
          subject,
          html,
        });
        return { sent: true, message: `Email sent to ${to}: "${subject}"` };
      } catch (error: any) {
        console.error(`[EmailService] Failed to send email to ${to}: ${error.message}`);
        return { sent: false, message: `Email failed: ${error.message}` };
      }
    }

    // Dev mode fallback: log to console
    console.error(`[EmailService] 📧 (Dev Mode — No SMTP configured)`);
    console.error(`  To: ${to}`);
    console.error(`  Subject: ${subject}`);
    console.error(`  Body: ${html.substring(0, 200)}...`);
    return { sent: true, message: `Email logged (dev mode) to ${to}: "${subject}"` };
  }

  /**
   * Generate welcome email HTML for a new employee.
   */
  welcomeEmail(employeeName: string, employeeId: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">🎉 Welcome to the Team!</h1>
        <p>Dear <strong>${employeeName}</strong>,</p>
        <p>Welcome aboard! Your employee ID is <strong>${employeeId}</strong>.</p>
        <p>Here's what's been set up for you:</p>
        <ul>
          <li>✅ HR profile created</li>
          <li>✅ IT equipment tickets raised</li>
          <li>✅ Introductory meeting scheduled</li>
        </ul>
        <p>Your manager has been notified. Looking forward to working with you!</p>
        <hr style="border: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">HR Assistant — Automated Notification</p>
      </div>
    `;
  }

  /**
   * Generate manager notification email HTML.
   */
  managerNotificationEmail(managerName: string, employeeName: string, employeeId: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">👋 New Team Member Onboarded</h1>
        <p>Hi <strong>${managerName}</strong>,</p>
        <p>A new team member has been onboarded and assigned to your team:</p>
        <ul>
          <li><strong>Name:</strong> ${employeeName}</li>
          <li><strong>Employee ID:</strong> ${employeeId}</li>
        </ul>
        <p>An introductory meeting has been scheduled. Please check your calendar.</p>
        <hr style="border: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">HR Assistant — Automated Notification</p>
      </div>
    `;
  }

  /**
   * Generate ticket status notification email HTML.
   */
  ticketUpdateEmail(employeeName: string, ticketId: string, item: string, status: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">🎫 Ticket Update</h1>
        <p>Hi <strong>${employeeName}</strong>,</p>
        <p>Your IT ticket has been updated:</p>
        <ul>
          <li><strong>Ticket:</strong> ${ticketId}</li>
          <li><strong>Item:</strong> ${item}</li>
          <li><strong>Status:</strong> ${status}</li>
        </ul>
        <hr style="border: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">HR Assistant — Automated Notification</p>
      </div>
    `;
  }
}
