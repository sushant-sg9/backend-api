const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const ApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

module.exports  = {ApiInstance , sendSmtpEmail}