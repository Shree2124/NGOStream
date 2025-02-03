import { createTransport } from "nodemailer";

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
