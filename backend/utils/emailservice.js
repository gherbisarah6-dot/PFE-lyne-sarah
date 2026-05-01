/**
 * =============================================================================
 * EMAIL SERVICE — utils/emailservice.js
 * =============================================================================
 *
 * PURPOSE:
 * Centralized email sending for appointment workflows.
 *
 * REQUIREMENT (Patient Portal / Clinic flow):
 * When an appointment status is updated to "Confirmed", we must trigger a
 * "Success" email automatically.
 *
 * NOTE:
 * This project might run without SMTP credentials during development. In that
 * case, we "gracefully degrade" by logging the email payload instead of
 * throwing, so the backend keeps working.
 * =============================================================================
 */

const nodemailer = require('nodemailer');

function getMailTransport() {
  // Common SMTP env var names (try them in order).
  const host =
    process.env.SMTP_HOST ||
    process.env.MAIL_HOST ||
    process.env.EMAIL_HOST;

  const port = Number(
    process.env.SMTP_PORT ||
    process.env.MAIL_PORT ||
    process.env.EMAIL_PORT ||
    587
  );

  const user =
    process.env.SMTP_USER ||
    process.env.MAIL_USER ||
    process.env.EMAIL_USER;

  const pass =
    process.env.SMTP_PASS ||
    process.env.MAIL_PASS ||
    process.env.EMAIL_PASS;

  // If we don't have enough data, return null so caller can log instead.
  if (!host || !port || !user || !pass) {
    return null;
  }

  const secure =
    String(process.env.SMTP_SECURE || process.env.MAIL_SECURE || '')
      .toLowerCase() === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

function formatAppointmentDate(dateValue) {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * sendSuccessEmail
 *
 * Sends an email to the patient once appointment is marked "Confirmed".
 *
 * @param {Object} params
 * @param {string} params.to - patient email address
 * @param {string} params.patientName
 * @param {string} params.doctorName
 * @param {string|Date} params.appointmentDate
 * @param {string} [params.appointmentId]
 * @returns {Promise<{sent: boolean, transportUsed: boolean}>}
 */
async function sendSuccessEmail({ to, patientName, doctorName, appointmentDate, appointmentId }) {
  if (!to) {
    return { sent: false, transportUsed: false };
  }

  const transport = getMailTransport();
  const from = process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.EMAIL_FROM || 'no-reply@clinic.com';

  const subject = 'Your appointment is confirmed ✅';
  const text = [
    `Hello ${patientName || 'patient'},`,
    '',
    'Your appointment has been confirmed successfully.',
    `Doctor: ${doctorName || 'Clinic'}`,
    `Date: ${formatAppointmentDate(appointmentDate)}`,
    appointmentId ? `Appointment ID: ${appointmentId}` : '',
    '',
    'Thank you for choosing our clinic.',
    'MedFlow'
  ].filter(Boolean).join('\n');

  const mailOptions = { from, to, subject, text };

  if (!transport) {
    // Development fallback
    console.log('[emailservice] Missing SMTP credentials — logging success email payload instead of sending.');
    console.log('[emailservice] mailOptions:', mailOptions);
    return { sent: false, transportUsed: false };
  }

  await transport.sendMail(mailOptions);
  return { sent: true, transportUsed: true };
}

module.exports = {
  sendSuccessEmail
};
