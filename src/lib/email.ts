import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

interface MagnetEmailParams {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  body: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}

export async function sendMagnetEmail(params: MagnetEmailParams): Promise<void> {
  await getResend().emails.send({
    from: params.from,
    to: params.to,
    replyTo: params.replyTo,
    subject: params.subject,
    text: params.body,
    attachments: [
      {
        filename: params.pdfFilename,
        content: params.pdfBuffer,
      },
    ],
  });
}
