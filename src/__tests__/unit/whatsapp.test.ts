// ─── WhatsApp URL Generation Tests ──────────────────────────────────────────
// Tests for WhatsApp deep link generation and validation (BRD §20).
// ──────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { generateWhatsAppUrl } from '@/modules/services/service';

describe('WhatsApp URL Generation', () => {
  it('should generate a valid wa.me URL', () => {
    const url = generateWhatsAppUrl(
      '919876543210',
      'Hello, I am interested in the {serviceName} service from MaziVastu.',
      'Loan'
    );

    expect(url).toContain('https://wa.me/919876543210');
    expect(url).toContain('text=');
    expect(url).toContain('Loan');
    expect(url).not.toContain('{serviceName}');
  });

  it('should URL-encode the message', () => {
    const url = generateWhatsAppUrl(
      '919876543210',
      'Hello, I need {serviceName} help!',
      'Painters'
    );

    // Message should be URL-encoded
    expect(url).toContain(encodeURIComponent('Hello, I need Painters help!'));
  });

  it('should replace {serviceName} placeholder', () => {
    const url = generateWhatsAppUrl(
      '919876543210',
      'Need {serviceName} and {serviceName} again',
      'Plumbers'
    );

    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).toBe('Need Plumbers and Plumbers again');
  });

  it('should reject invalid phone numbers', () => {
    expect(() => {
      generateWhatsAppUrl('123', 'Test', 'Service');
    }).toThrow('Invalid WhatsApp number format');
  });

  it('should reject phone numbers with letters', () => {
    expect(() => {
      generateWhatsAppUrl('91abc543210', 'Test', 'Service');
    }).toThrow('Invalid WhatsApp number format');
  });

  it('should accept valid international numbers', () => {
    const url = generateWhatsAppUrl(
      '447911123456',
      'Hello {serviceName}',
      'Engineers'
    );

    expect(url).toContain('https://wa.me/447911123456');
  });
});
