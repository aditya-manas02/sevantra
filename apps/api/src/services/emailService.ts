import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTP = async (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Sevantra Support" <support@sevantra.com>',
    to,
    subject: 'Verify your Sevantra Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Sevantra!</h2>
        <p>Please use the following One-Time Password (OTP) to verify your email address:</p>
        <h1 style="font-size: 36px; letter-spacing: 5px; color: #1a56db;">${otp}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    
    // For ethereal email, we log the preview URL to the console so we can see it during dev
    if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.SMTP_HOST) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
};
