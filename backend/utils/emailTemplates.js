const generateVerificationTemplate = (otp) => {
    return `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          table { max-width: 500px; margin: 30px auto; background: #ffffff; border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); padding: 20px; }
          td { padding: 10px; text-align: center; }
          .header img { width: 120px; margin-bottom: 20px; }
          .otp { display: inline-block; font-size: 20px; font-weight: bold; color: #ffffff; background: #007bff;
                 padding: 10px 20px; border-radius: 5px; letter-spacing: 2px; margin: 15px 0; }
          .footer { font-size: 12px; color: #777; margin-top: 20px; }
        </style>
      </head>
      <body>
        <table cellpadding="0" cellspacing="0" border="0" align="center">
          <tr>
            <td>
              <h2>Welcome to HookStep!</h2>
              <p>To complete your registration, please verify your email using the OTP below.</p>
              <div class="otp">${otp}</div>
              <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
            </td>
          </tr>
          <tr>
            <td>
              <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
              <p class="footer">&copy; ${new Date().getFullYear()} HookStep. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };
  
  const generateResetPasswordTemplate = (otp) => {
    return `
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background-color: #f4f4f4; 
            margin: 0; 
            padding: 0; 
            text-align: center;
          }
          table { 
            max-width: 500px; 
            margin: 30px auto; 
            background: #ffffff; 
            border-radius: 8px; 
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); 
            padding: 20px; 
            width: 100%;
          }
          td { 
            padding: 15px; 
            text-align: center; 
          }
          h2 {
            color: #333;
          }
          p {
            font-size: 16px; 
            color: #555; 
            margin: 10px 0;
          }
          .otp { 
            display: inline-block; 
            font-size: 22px; 
            font-weight: bold; 
            color: #ffffff; 
            background: #d9534f; 
            padding: 12px 24px; 
            border-radius: 6px; 
            letter-spacing: 2px; 
            margin: 15px 0; 
          }
          .footer { 
            font-size: 12px; 
            color: #777; 
            margin-top: 20px; 
          }
          hr {
            border: 0; 
            height: 1px; 
            background: #ddd; 
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <table cellpadding="0" cellspacing="0" border="0" align="center">
          <tr>
            <td>
              <h2>Wellcome to hookstep</h2>
              <h3>Password Reset Request</h3>
              <p>We received a request to reset your password. Use the OTP below to proceed.</p>
              <div class="otp">${otp}</div>
              <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
              <p>If you did not request this, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td>
              <hr>
              <p class="footer">&copy; ${new Date().getFullYear()} HookStep. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };
  
  module.exports = { generateVerificationTemplate, generateResetPasswordTemplate };
  