import { createTransport } from "nodemailer";
import { Event } from "../models/events.model";

import schedule from "node-schedule";
const sendMail = async (email: any, subject: any, data: any) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // console.log(process.env.EMAIL_PASSWORD, process.env.EMAIL_ADDRESS);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: red;
        }
        p {
            margin-bottom: 20px;
            color: #666;
        }
        .otp {
            font-size: 36px;
            color: #7b68ee; /* Purple text */
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>OTP Verification</h1>
        <p>Hello ${data.name} your (One-Time Password) for your account verification is.</p>
        <p class="otp">${data.otp}</p> 
    </div>
</body>
</html>
`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject,
    html,
  });
};

export default sendMail;

export const sendForgotMail = async (subject: any, data: any) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_PASSWORD!,
      pass: process.env.NEXT_PUBLIC_EMAIL_ADDRESS!,
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f3f3f3;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      padding: 20px;
      margin: 20px auto;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 600px;
    }
    h1 {
      color: #5a2d82;
    }
    p {
      color: #666666;
    }
    .button {
      display: inline-block;
      padding: 15px 25px;
      margin: 20px 0;
      background-color: #5a2d82;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 16px;
    }
    .footer {
      margin-top: 20px;
      color: #999999;
      text-align: center;
    }
    .footer a {
      color: #5a2d82;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Reset Your Password</h1>
    <p>Hello,</p>
    <p>You have requested to reset your password. Please click the button below to reset your password.</p>
    <a href="${process.env.frontendurl}/reset-password/${data.token}" class="button">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    <div class="footer">
      <p>Thank you,<br>Your Website Team</p>
      <p><a href="https://yourwebsite.com">yourwebsite.com</a></p>
    </div>
  </div>
</body>
</html>
`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: data.email,
    subject,
    html,
  });
};

export const sendReceiptEmail = async (
  donor: any,
  receiptPath: string,
  donation: any
) => {
  try {
    const transporter = createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.Gmail,
      to: donor.email,
      subject: "Thank you for your Donation",
      html: `
        <p>Dear ${donor.name},</p>
        <p>Thank you for your generous donation.</p>
        <p>Donation Details:</p>
        <ul>
          <li><strong>Type:</strong> ${donation.donationType}</li>
          <li><strong>Amount:</strong> ${
            donation.monetaryDetails?.amount
              ? `${donation.monetaryDetails.amount} ${donation.monetaryDetails.currency}`
              : "N/A"
          }</li>
          <li><strong>Date:</strong> ${new Date(
            donation.createdAt
          ).toLocaleDateString()}</li>
        </ul>
        <p>Your receipt is attached.</p>
        <a href="${receiptPath}" 
           style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;"
           download>
          Download Receipt
        </a>
      `,
      attachments: [
        {
          filename: `${donation._id}-${donor.name}.pdf`,
          path: receiptPath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log(`Email sent: ${info.messageId}`);
    return "Receipt email sent successfully!";
  } catch (error) {
    console.error("Error sending receipt email:", error);
    throw error;
  }
};

export const sendRegistrationMail = async (member: any, event: any) => {
  try {
    if (!member || !event) {
      throw new Error("Member or Event not found.");
    }

    const transporter = createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.Gmail,
      to: member.email,
      subject: `Registration Confirmation for ${event.name}`,
      text: `Dear ${member.fullName},\n\nYou have successfully registered for the event '${event.name}' scheduled from ${event.startDate} to ${event.endDate}. The event will be held at ${event.location}. We look forward to your participation!\n\nBest Regards,\nNGO Stream Team`,
    };

    await transporter.sendMail(mailOptions);
    // console.log("Registration email sent successfully.");
  } catch (error) {
    console.error("Error sending registration email:", error);
  }
};
export const sendEventReminderEmail = async (member: any, event: any) => {
  try {
    if (!member || !event) {
      throw new Error("Member or Event not found.");
    }

    const transporter = createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const eventDate = new Date(event.startDate);
    const formattedDate = eventDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const mailOptions = {
      from: process.env.Gmail,
      to: member.email,
      subject: `Reminder: ${event.name} starts soon!`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Reminder</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 8px;
              padding: 20px;
              border: 1px solid #ddd;
            }
            h1 {
              color: #5a2d82;
            }
            .event-details {
              background-color: #fff;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
              border-left: 4px solid #5a2d82;
            }
            .button {
              display: inline-block;
              background-color: #5a2d82;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your Event is Starting Soon!</h1>
            <p>Hello ${member.fullName},</p>
            <p>This is a friendly reminder that the event <strong>${event.name}</strong> is starting soon.</p>
            
            <div class="event-details">
              <p><strong>Date and Time:</strong> ${formattedDate}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <p><strong>Your Role:</strong> Attendee</p>
            </div>
            
            <p>We look forward to your participation!</p>
            
            <p>Best regards,<br>NGO Stream Team</p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `Reminder email sent to ${member.email} for event ${event.name}`
    );
  } catch (error) {
    console.error("Error sending event reminder email:", error);
  }
};

// Function to send feedback request email
export const sendFeedbackRequestEmail = async (member: any, event: any) => {
  try {
    if (!member || !event) {
      throw new Error("Member or Event not found.");
    }

    const transporter = createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Create a feedback form URL with event ID
    const feedbackUrl = `${process.env.frontendurl}/feedback/${event._id}`;

    const mailOptions = {
      from: process.env.Gmail,
      to: member.email,
      subject: `Please share your feedback on ${event.name}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Feedback Request</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 8px;
              padding: 20px;
              border: 1px solid #ddd;
            }
            h1 {
              color: #5a2d82;
            }
            .event-info {
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background-color: #5a2d82;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .thank-you {
              font-style: italic;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>We Value Your Feedback</h1>
            <p>Dear ${member.fullName},</p>
            
            <p>Thank you for attending our event <strong>${event.name}</strong>. We hope you found it valuable and enjoyable.</p>
            
            <div class="event-info">
              <p>Your feedback is extremely important to us as it helps us improve our future events.</p>
              <p>It will only take a minute of your time to complete the short feedback form:</p>
            </div>
            
            <a href="${feedbackUrl}" class="button">Share Your Feedback</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>${feedbackUrl}</p>
            
            <p class="thank-you">Thank you for your participation and support!</p>
            
            <p>Best regards,<br>NGO Stream Team</p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `Feedback request email sent to ${member.email} for event ${event.name}`
    );
  } catch (error) {
    console.error("Error sending feedback request email:", error);
  }
};

// Function to schedule event reminder emails
export const scheduleEventReminders = async (eventId: any) => {
  try {
    const event = await Event.findById(eventId).populate(
      "participants.memberId",
      "fullName email"
    );

    if (!event) {
      throw new Error("Event not found");
    }

    const eventStartTime = new Date(event.startDate);
    const reminderTime = new Date(eventStartTime.getTime() - 10 * 60000); // 10 minutes before start

    // Schedule reminder emails
    event.participants.forEach((participant: any) => {
      if (participant.role === "Attendee" && participant.memberId) {
        // Schedule the job
        schedule.scheduleJob(reminderTime, async () => {
          await sendEventReminderEmail(participant.memberId, event);
        });

        console.log(
          `Reminder scheduled for ${participant.memberId.email} at ${reminderTime}`
        );
      }
    });

    return true;
  } catch (error) {
    console.error("Error scheduling event reminders:", error);
    return false;
  }
};

export const scheduleFeedbackEmails = async (eventId: any) => {
  try {
    const event = await Event.findById(eventId).populate(
      "participants.memberId",
      "fullName email"
    );

    if (!event) {
      throw new Error("Event not found");
    }

    const eventEndTime = new Date(event.endDate);
    const feedbackTime = new Date(eventEndTime.getTime() + 15 * 60000); // 15 minutes after end

    // Schedule feedback emails
    event.participants.forEach((participant: any) => {
      if (participant.role === "Attendee" && participant.memberId) {
        // Schedule the job
        schedule.scheduleJob(feedbackTime, async () => {
          await sendFeedbackRequestEmail(participant.memberId, event);
        });

        console.log(
          `Feedback email scheduled for ${participant.memberId.email} at ${feedbackTime}`
        );
      }
    });

    return true;
  } catch (error) {
    console.error("Error scheduling feedback emails:", error);
    return false;
  }
};

export const sendAdminCredentialMail = async (admin: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const transport = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Account Created</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f3f3f3;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      padding: 20px;
      margin: 20px auto;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 600px;
    }
    h1 {
      color: #5a2d82;
    }
    p {
      color: #666666;
    }
    .credentials {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      border-left: 4px solid #5a2d82;
    }
    .warning {
      color: #cc0000;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      padding: 15px 25px;
      margin: 20px 0;
      background-color: #5a2d82;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 16px;
    }
    .footer {
      margin-top: 20px;
      color: #999999;
      text-align: center;
    }
    .footer a {
      color: #5a2d82;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to NGO Admin Portal</h1>
    <p>Hello ${admin.name},</p>
    <p>Your administrator account has been created successfully. You can now log in to the NGO Admin Portal using the following credentials:</p>
    
    <div class="credentials">
      <p><strong>Email:</strong> ${admin.email}</p>
      <p><strong>Password:</strong> ${admin.password}</p>
    </div>
    
    <p class="warning">Please change your password after your first login for security reasons.</p>
    

    
    <p>If you have any questions or need assistance, please contact the system administrator.</p>
    
    <div class="footer">
      <p>Thank you,<br>NGO Stream Team</p>
    </div>
  </div>
</body>
</html>`;

    await transport.sendMail({
      from: process.env.Gmail,
      to: admin.email,
      subject: "Your NGO Admin Portal Account Credentials",
      html,
    });

    return "Admin credentials email sent successfully!";
  } catch (error) {
    console.error("Error sending admin credentials email:", error);
    throw error;
  }
};

export const sendAdminDeletionMail = async (adminDetails: {
  name: string;
  email: string;
}) => {
  try {
    const transport = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Account Deleted</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f3f3f3;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      padding: 20px;
      margin: 20px auto;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 600px;
    }
    h1 {
      color: #5a2d82;
    }
    p {
      color: #666666;
    }
    .message {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      border-left: 4px solid #e74c3c;
    }
    .contact {
      background-color: #f0f0f0;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 20px;
      color: #999999;
      text-align: center;
    }
    .footer a {
      color: #5a2d82;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Account Access Notification</h1>
    <p>Hello ${adminDetails.name},</p>
    
    <div class="message">
      <p>This is to inform you that your administrator account with the NGO Admin Portal has been removed.</p>
    </div>
    
    <p>If you were not expecting this change or believe this was done in error, please contact the system administrator immediately.</p>
    
    <div class="contact">
      <p><strong>For assistance:</strong></p>
      <p>Please contact the system administrator at <a href="mailto:${process.env.EMAIL_ADDRESS}">${process.env.EMAIL_ADDRESS}</a></p>
    </div>
    
    <p>We appreciate your past contributions to our organization.</p>
    
    <div class="footer">
      <p>Thank you,<br>NGO Stream Team</p>
    </div>
  </div>
</body>
</html>`;

    await transport.sendMail({
      from: process.env.Gmail,
      to: adminDetails.email,
      subject: "Your NGO Admin Portal Account Access",
      html,
    });

    return "Admin deletion notification email sent successfully!";
  } catch (error) {
    console.error("Error sending admin deletion email:", error);
    throw error;
  }
};

export const sendMemberEnrollmentEmail = async (member: any) => {
  try {
    if (!member) {
      throw new Error("Member details not found.");
    }

    const transporter = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our NGO!</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f3f3f3;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      padding: 20px;
      margin: 20px auto;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 600px;
    }
    h1 {
      color: #5a2d82;
    }
    p {
      color: #666666;
    }
    .welcome-message {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      border-left: 4px solid #5a2d82;
    }
    .details {
      background-color: #f0f0f0;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 15px 25px;
      margin: 20px 0;
      background-color: #5a2d82;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 16px;
    }
    .footer {
      margin-top: 20px;
      color: #999999;
      text-align: center;
    }
    .footer a {
      color: #5a2d82;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Our NGO!</h1>
    <p>Hello ${member.fullName},</p>
    
    <div class="welcome-message">
      <p>We are delighted to inform you that your enrollment with our organization has been successfully processed. Welcome to our community!</p>
    </div>
    
    <p>Your membership details:</p>
    <div class="details">
      <p><strong>Name:</strong> ${member.fullName}</p>
      <p><strong>Email:</strong> ${member.email}</p>
      <p><strong>Role:</strong> ${member.role}</p>
      <p><strong>Member Since:</strong> ${new Date(
        member.createdAt || Date.now()
      ).toLocaleDateString()}</p>
    </div>
    
    <p>As a member of our NGO, you'll have access to various events, volunteer opportunities, and resources. We look forward to your active participation in our initiatives.</p>
    
    <a href="${
      process.env.frontendurl
    }/member/login" class="button">Login to Your Account</a>
    
    <p>If you have any questions or need assistance, please feel free to contact us.</p>
    
    <div class="footer">
      <p>Thank you,<br>NGO Stream Team</p>
    </div>
  </div>
</body>
</html>`;

    const mailOptions = {
      from: process.env.Gmail,
      to: member.email,
      subject: "Welcome to Our NGO - Enrollment Confirmation",
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Enrollment confirmation email sent to ${member.email}`);
    return "Member enrollment email sent successfully!";
  } catch (error) {
    console.error("Error sending member enrollment email:", error);
    throw error;
  }
};
