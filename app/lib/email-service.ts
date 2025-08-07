// Email service for sending booking confirmations and notifications
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface BookingEmailData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  staffName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  notes?: string;
  price?: number;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Use environment variables for email configuration
    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || ''
      }
    };

    // Only initialize if credentials are provided
    if (config.auth.user && config.auth.pass) {
      this.transporter = nodemailer.createTransport(config);
      console.log('✅ Email service initialized');
    } else {
      console.warn('⚠️ Email service not configured. Emails will not be sent.');
    }
  }

  // Send booking confirmation email to client
  async sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured. Skipping booking confirmation email.');
      return false;
    }

    try {
      const emailHtml = this.generateBookingConfirmationHtml(data);
      const emailText = this.generateBookingConfirmationText(data);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@skinsociete.com.au',
        to: data.clientEmail,
        subject: `Booking Confirmation - ${data.serviceName} at ${data.clinicName}`,
        text: emailText,
        html: emailHtml
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Booking confirmation email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send booking confirmation email:', error);
      return false;
    }
  }

  // Send booking notification to clinic staff
  async sendBookingNotificationToStaff(data: BookingEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured. Skipping staff notification email.');
      return false;
    }

    try {
      const staffEmails = process.env.STAFF_NOTIFICATION_EMAILS?.split(',') || [];
      if (staffEmails.length === 0) {
        console.warn('No staff emails configured for notifications');
        return false;
      }

      const emailHtml = this.generateStaffNotificationHtml(data);
      const emailText = this.generateStaffNotificationText(data);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@skinsociete.com.au',
        to: staffEmails,
        subject: `New Booking: ${data.clientName} - ${data.serviceName}`,
        text: emailText,
        html: emailHtml
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Staff notification email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send staff notification email:', error);
      return false;
    }
  }

  // Generate HTML email for booking confirmation
  private generateBookingConfirmationHtml(data: BookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px; }
          .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #666; }
          .detail-value { color: #333; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Booking Confirmed! ✨</h1>
            <p style="margin: 10px 0 0 0;">Your appointment at Skin Societé has been confirmed</p>
          </div>
          <div class="content">
            <p>Dear ${data.clientName},</p>
            <p>Thank you for booking with Skin Societé. We're looking forward to seeing you!</p>
            
            <div class="booking-details">
              <h2 style="margin-top: 0; color: #667eea;">Appointment Details</h2>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${data.serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${data.appointmentDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${data.appointmentTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${data.duration} minutes</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Practitioner:</span>
                <span class="detail-value">${data.staffName}</span>
              </div>
              ${data.price ? `
              <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value">$${data.price}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="booking-details">
              <h3 style="margin-top: 0; color: #667eea;">Location</h3>
              <p style="margin: 5px 0;"><strong>${data.clinicName}</strong></p>
              ${data.clinicAddress ? `<p style="margin: 5px 0;">${data.clinicAddress}</p>` : ''}
              ${data.clinicPhone ? `<p style="margin: 5px 0;">Phone: ${data.clinicPhone}</p>` : ''}
            </div>
            
            ${data.notes ? `
            <div class="booking-details">
              <h3 style="margin-top: 0; color: #667eea;">Notes</h3>
              <p style="margin: 5px 0;">${data.notes}</p>
            </div>
            ` : ''}
            
            <h3>What to Expect</h3>
            <ul>
              <li>Please arrive 10 minutes before your appointment</li>
              <li>Bring any relevant medical history or previous treatment records</li>
              <li>Let us know if you have any allergies or medical conditions</li>
              <li>Feel free to ask any questions during your consultation</li>
            </ul>
            
            <h3>Need to Reschedule?</h3>
            <p>If you need to change or cancel your appointment, please contact us at least 24 hours in advance.</p>
            
            <center>
              <a href="mailto:${data.clinicName.toLowerCase().replace(' ', '')}@skinsociete.com.au" class="button">Contact Clinic</a>
            </center>
            
            <div class="footer">
              <p>This is an automated confirmation email. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Skin Societé. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate plain text email for booking confirmation
  private generateBookingConfirmationText(data: BookingEmailData): string {
    return `
Booking Confirmed!

Dear ${data.clientName},

Thank you for booking with Skin Societé. We're looking forward to seeing you!

APPOINTMENT DETAILS
-------------------
Service: ${data.serviceName}
Date: ${data.appointmentDate}
Time: ${data.appointmentTime}
Duration: ${data.duration} minutes
Practitioner: ${data.staffName}
${data.price ? `Price: $${data.price}` : ''}

LOCATION
--------
${data.clinicName}
${data.clinicAddress || ''}
${data.clinicPhone ? `Phone: ${data.clinicPhone}` : ''}

${data.notes ? `NOTES\n-----\n${data.notes}\n` : ''}

WHAT TO EXPECT
--------------
• Please arrive 10 minutes before your appointment
• Bring any relevant medical history or previous treatment records
• Let us know if you have any allergies or medical conditions
• Feel free to ask any questions during your consultation

NEED TO RESCHEDULE?
-------------------
If you need to change or cancel your appointment, please contact us at least 24 hours in advance.

This is an automated confirmation email. Please do not reply to this email.

© ${new Date().getFullYear()} Skin Societé. All rights reserved.
    `;
  }

  // Generate HTML email for staff notification
  private generateStaffNotificationHtml(data: BookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Booking Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; }
          .details { background: white; padding: 20px; border: 1px solid #e5e5e5; margin: 20px 0; }
          .row { padding: 8px 0; }
          .label { font-weight: bold; display: inline-block; width: 120px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">New Booking Alert</h2>
            <p style="margin: 5px 0;">A new appointment has been booked</p>
          </div>
          <div class="details">
            <div class="row"><span class="label">Client:</span> ${data.clientName}</div>
            <div class="row"><span class="label">Email:</span> ${data.clientEmail}</div>
            <div class="row"><span class="label">Service:</span> ${data.serviceName}</div>
            <div class="row"><span class="label">Date:</span> ${data.appointmentDate}</div>
            <div class="row"><span class="label">Time:</span> ${data.appointmentTime}</div>
            <div class="row"><span class="label">Duration:</span> ${data.duration} minutes</div>
            <div class="row"><span class="label">Staff:</span> ${data.staffName}</div>
            <div class="row"><span class="label">Location:</span> ${data.clinicName}</div>
            ${data.notes ? `<div class="row"><span class="label">Notes:</span> ${data.notes}</div>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate plain text email for staff notification
  private generateStaffNotificationText(data: BookingEmailData): string {
    return `
NEW BOOKING ALERT
-----------------

Client: ${data.clientName}
Email: ${data.clientEmail}
Service: ${data.serviceName}
Date: ${data.appointmentDate}
Time: ${data.appointmentTime}
Duration: ${data.duration} minutes
Staff: ${data.staffName}
Location: ${data.clinicName}
${data.notes ? `Notes: ${data.notes}` : ''}
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export type for use in other files
export type { BookingEmailData };