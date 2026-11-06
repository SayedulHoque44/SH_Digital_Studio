import nodemailer, { Transporter } from "nodemailer";
import config from "../config";
import { logger } from "./logger";

/**
 * E-mail notifications via any SMTP provider (Gmail app password, Zoho,
 * Brevo, Resend SMTP, Amazon SES, ...). Credentials come from environment
 * variables only. When SMTP is not configured, nothing is sent and callers
 * are told so - the website never claims an e-mail was delivered when it
 * was not.
 */
export const isMailConfigured = () =>
  Boolean(config.smtp_host && config.smtp_user && config.smtp_pass && config.mail_from);

let transporter: Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_secure,
      auth: { user: config.smtp_user, pass: config.smtp_pass },
    });
  }
  return transporter;
};

export type TMailResult = { attempted: boolean; sent: boolean; error?: string };

export const sendMail = async (options: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<TMailResult> => {
  if (!isMailConfigured()) {
    return { attempted: false, sent: false, error: "SMTP not configured" };
  }
  try {
    await getTransporter().sendMail({
      from: config.mail_from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      replyTo: options.replyTo,
    });
    return { attempted: true, sent: true };
  } catch (error: any) {
    // Log the failure reason only - never the message body (personal data).
    logger.error("E-mail notification failed", { reason: error?.message });
    return { attempted: true, sent: false, error: "Delivery failed" };
  }
};
