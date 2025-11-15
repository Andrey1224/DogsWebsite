interface InquiryData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  puppy_id?: string;
  puppy_slug?: string;
  timestamp: string;
  source: string;
}

/**
 * Escape HTML special characters to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

export function generateOwnerNotificationEmail(inquiry: InquiryData): string {
  const { name, email, phone, message, puppy_id, puppy_slug, timestamp, source } = inquiry;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Escape all user-provided data to prevent XSS
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = phone ? escapeHtml(phone) : null;
  const safeMessage = escapeHtml(message);
  const safePuppyId = puppy_id ? escapeHtml(puppy_id) : null;
  const safePuppySlug = puppy_slug ? escapeHtml(puppy_slug) : null;
  const safeSource = escapeHtml(source);

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Inquiry - Exotic Bulldog Legacy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .puppy-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .message { background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap; }
        .actions { margin-top: 20px; }
        .btn { display: inline-block; padding: 10px 20px; margin-right: 10px; margin-bottom: 10px;
                border-radius: 5px; text-decoration: none; color: white; font-weight: bold; }
        .btn-email { background: #007bff; }
        .btn-phone { background: #28a745; }
        .btn-view { background: #6c757d; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;
                 font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐾 New Inquiry Received</h1>
            <p><strong>Date:</strong> ${timestamp}</p>
            <p><strong>Source:</strong> ${safeSource}</p>
        </div>

        <div class="section">
            <h2>Customer Information</h2>
            <div class="field">
                <span class="label">Name:</span>
                <span class="value">${safeName}</span>
            </div>
            <div class="field">
                <span class="label">Email:</span>
                <a href="mailto:${safeEmail}" style="color: #007bff;">${safeEmail}</a>
            </div>
            ${
              safePhone
                ? `
            <div class="field">
                <span class="label">Phone:</span>
                <a href="tel:${safePhone}" style="color: #007bff;">${safePhone}</a>
            </div>
            `
                : ''
            }
        </div>

        ${
          safePuppyId
            ? `
        <div class="puppy-info">
            <h3>🐕 Puppy Interest</h3>
            <div class="field">
                <span class="label">Puppy ID:</span>
                <span class="value">${safePuppyId}</span>
            </div>
            ${
              safePuppySlug
                ? `
            <div class="field">
                <span class="label">Puppy Page:</span>
                <a href="${siteUrl}/puppies/${safePuppySlug}" style="color: #007bff;">View Puppy Details</a>
            </div>
            `
                : ''
            }
        </div>
        `
            : ''
        }

        <div class="section">
            <h2>Message</h2>
            <div class="message">${safeMessage}</div>
        </div>

        <div class="actions">
            <h3>Quick Actions</h3>
            <a href="mailto:${safeEmail}" class="btn btn-email">📧 Reply via Email</a>
            ${safePhone ? `<a href="tel:${safePhone}" class="btn btn-phone">📞 Call Customer</a>` : ''}
            ${safePuppySlug ? `<a href="${siteUrl}/puppies/${safePuppySlug}" class="btn btn-view">👁️ View Puppy</a>` : ''}
        </div>

        <div class="footer">
            <p>This inquiry was submitted through the Exotic Bulldog Legacy website.<br>
            Please respond within one business day.</p>
        </div>
    </div>
</body>
</html>
  `;
}

export function generateCustomerConfirmationEmail(name: string): string {
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+17727779442';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'nepod77@gmail.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Escape user-provided name to prevent XSS
  const safeName = escapeHtml(name);

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You - Exotic Bulldog Legacy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; }
        .info-box h3 { margin-top: 0; color: #495057; }
        .contact-item { display: flex; justify-content: space-between; align-items: center;
                       padding: 15px; background: #f5f5f5; margin-bottom: 10px; border-radius: 5px; }
        .contact-label { font-weight: bold; color: #495057; }
        .contact-value { color: #007bff; text-decoration: none; font-weight: bold; }
        .highlight { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px;
                   border-radius: 8px; margin-bottom: 25px; }
        .cta { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 15px 30px; background: #007bff; color: white;
               text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px;
                 border-top: 1px solid #eee; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 20px;">🐾</div>
            <h1>Thank You for Your Interest!</h1>
            <p>Your inquiry has been received by Exotic Bulldog Legacy</p>
        </div>

        <div class="section">
            <div class="highlight">
                <h2>What Happens Next?</h2>
                <p>Hi ${safeName}, we've received your message and will respond within one business day with information about our available puppies, pricing, and next steps.</p>
            </div>
        </div>

        <div class="section">
            <h2>Get in Touch</h2>
            <div class="info-box">
                <div class="contact-item">
                    <div>
                        <div class="contact-label">📞 Phone</div>
                        <div style="font-size: 14px; color: #666;">Call or text us</div>
                    </div>
                    <a href="tel:${contactPhone}" class="contact-value">${contactPhone}</a>
                </div>
                <div class="contact-item">
                    <div>
                        <div class="contact-label">📧 Email</div>
                        <div style="font-size: 14px; color: #666;">Send us a message</div>
                    </div>
                    <a href="mailto:${contactEmail}" class="contact-value">${contactEmail}</a>
                </div>
                <div class="contact-item">
                    <div>
                        <div class="contact-label">💬 WhatsApp</div>
                        <div style="font-size: 14px; color: #666;">Instant messaging</div>
                    </div>
                    <a href="https://wa.me/${contactPhone.replace(/\D/g, '')}" class="contact-value">Message Us</a>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="info-box" style="background: #fff3cd; border: 1px solid #ffeaa7;">
                <h3>🏠 About Exotic Bulldog Legacy</h3>
                <p>We specialize in breeding high-quality French and English Bulldogs with health guarantees, proper socialization, and loving care. All our puppies come with health records and lifetime support.</p>
            </div>
        </div>

        <div class="cta">
            <a href="${siteUrl}" class="btn">🌐 View Available Puppies</a>
        </div>

        <div class="footer">
            <p>Questions? Feel free to reach out through any of the contact methods above.</p>
            <p style="margin-top: 10px; font-size: 12px;">© 2025 Exotic Bulldog Legacy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
}
