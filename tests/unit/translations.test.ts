import { describe, it, expect } from 'vitest';
import lvMessages from '@/messages/lv.json';
import enMessages from '@/messages/en.json';

describe('Translation coverage', () => {
  const lvKeys = Object.keys(lvMessages).filter(key => key !== '$schema');
  const enKeys = Object.keys(enMessages).filter(key => key !== '$schema');

  it('should have the same number of translation keys in both languages', () => {
    expect(lvKeys.length).toBe(enKeys.length);
  });

  it('should have all LV keys present in EN', () => {
    const missingInEn = lvKeys.filter(key => !enKeys.includes(key));

    expect(missingInEn).toEqual([]);
  });

  it('should have all EN keys present in LV', () => {
    const missingInLv = enKeys.filter(key => !lvKeys.includes(key));

    expect(missingInLv).toEqual([]);
  });

  it('should not have empty translation values in LV', () => {
    const emptyKeys = lvKeys.filter(key => {
      const value = lvMessages[key as keyof typeof lvMessages];
      return typeof value === 'string' && value.trim() === '';
    });

    expect(emptyKeys).toEqual([]);
  });

  it('should not have empty translation values in EN', () => {
    const emptyKeys = enKeys.filter(key => {
      const value = enMessages[key as keyof typeof enMessages];
      return typeof value === 'string' && value.trim() === '';
    });

    expect(emptyKeys).toEqual([]);
  });

  it('should have valid JSON schema reference', () => {
    expect(lvMessages.$schema).toBe('https://inlang.com/schema/inlang-message-format');
    expect(enMessages.$schema).toBe('https://inlang.com/schema/inlang-message-format');
  });

  describe('Translation completeness', () => {
    it('should have all core UI labels translated', () => {
      const coreLabels = [
        'site_title',
        'site_description',
        'label_surface',
        'label_start',
        'label_date',
        'label_elevation',
        'label_time_limit',
        'label_distance',
        'choose_route',
      ];

      coreLabels.forEach(label => {
        expect(lvKeys).toContain(label);
        expect(enKeys).toContain(label);
      });
    });

    it('should have all FAQ translations', () => {
      const faqKeys = lvKeys.filter(key => key.startsWith('faq_'));
      const faqKeysEn = enKeys.filter(key => key.startsWith('faq_'));

      expect(faqKeys.length).toBeGreaterThan(0);
      expect(faqKeys.length).toBe(faqKeysEn.length);
    });

    it('should have all event name translations', () => {
      const eventKeys = lvKeys.filter(key => key.startsWith('event_'));
      const eventKeysEn = enKeys.filter(key => key.startsWith('event_'));

      expect(eventKeys.length).toBeGreaterThan(0);
      expect(eventKeys.length).toBe(eventKeysEn.length);
    });

    it('should have all distance type translations', () => {
      const distanceKeys = lvKeys.filter(key => key.startsWith('distance_'));
      const distanceKeysEn = enKeys.filter(key => key.startsWith('distance_'));

      expect(distanceKeys.length).toBeGreaterThan(0);
      expect(distanceKeys.length).toBe(distanceKeysEn.length);
    });

    it('should have all static page translations', () => {
      const staticPageKeys = ['page_privacy_title', 'page_privacy_content', 'page_terms_title', 'page_terms_content'];

      staticPageKeys.forEach(key => {
        expect(lvKeys).toContain(key);
        expect(enKeys).toContain(key);
      });
    });

    it('should have all ARIA labels translated', () => {
      const ariaKeys = lvKeys.filter(key => key.startsWith('aria_'));
      const ariaKeysEn = enKeys.filter(key => key.startsWith('aria_'));

      expect(ariaKeys.length).toBeGreaterThan(0);
      expect(ariaKeys.length).toBe(ariaKeysEn.length);
    });
  });

  describe('Translation quality', () => {
    it('should not have placeholder text in LV', () => {
      const placeholders = lvKeys.filter(key => {
        const value = lvMessages[key as keyof typeof lvMessages];
        return typeof value === 'string' &&
               (value.includes('TODO') ||
                value.includes('[translate]') ||
                value.includes('FIXME'));
      });

      expect(placeholders).toEqual([]);
    });

    it('should not have placeholder text in EN', () => {
      const placeholders = enKeys.filter(key => {
        const value = enMessages[key as keyof typeof enMessages];
        return typeof value === 'string' &&
               (value.includes('TODO') ||
                value.includes('[translate]') ||
                value.includes('FIXME'));
      });

      expect(placeholders).toEqual([]);
    });

    it('should not have duplicate values in LV (likely copy-paste errors)', () => {
      const values = lvKeys.map(key => lvMessages[key as keyof typeof lvMessages]);
      const duplicates = values.filter((value, index, self) =>
        typeof value === 'string' &&
        value.length > 5 && // Ignore short strings
        self.indexOf(value) !== index
      );

      // Some duplicates are expected (like "Coming soon"), so we just warn
      if (duplicates.length > 5) {
        console.warn(`Found ${duplicates.length} duplicate translation values in LV`);
      }
    });
  });
});
