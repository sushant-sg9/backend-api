const { sendSmtpEmail, ApiInstance } = require('../Config/brevomail.config');
const {
  generateVerificationTemplate,
  generateResetPasswordTemplate,
} = require('./emailTemplates');

const sendBrevoEmail = async (email, type, otp) => {
  try {
    const subject =
      type === 'verification'
        ? 'Welcome to HookStep - Verify Your Email'
        : 'HookStep - Reset Your Password';

    const message =
      type === 'verification'
        ? generateVerificationTemplate(otp)
        : generateResetPasswordTemplate(otp);

    sendSmtpEmail.sender = {
      name: 'HookStep',
      email: 'gazifayaz.wani@Genixbit.com',
    };

    sendSmtpEmail.to = [{ email, name: 'Recipient Name' }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = message;

    const data = await ApiInstance.sendTransacEmail(sendSmtpEmail);

    return {
      success: true,
      data,
    };
  } catch (error) {
    throw new Error('Email Send Failed' + error);
  }
};

module.exports = { sendBrevoEmail };
