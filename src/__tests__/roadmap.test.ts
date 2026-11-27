import { describe, expect, it } from 'vitest';
import { plainText, toRoadmap } from '@/lib/roadmap';

describe('toRoadmap', () => {
  it('groups records by status, oldest first, and skips what must not show', () => {
    const roadmap = toRoadmap([
      {
        _id: 'b',
        createdAt: '2026-11-02T00:00:00Z',
        data: { title: 'GIF export', status: 'planned' },
      },
      {
        _id: 'a',
        createdAt: '2026-11-01T00:00:00Z',
        data: {
          title: 'Vertical captions',
          summary: '<p>Captions that fit <strong>9:16</strong> &amp; 1:1.</p>',
          status: 'planned',
        },
      },
      { _id: 'c', data: { title: 'Brand kits', status: 'in-progress' } },
      {
        _id: 'd',
        data: { title: 'Old idea', status: 'planned' },
        archived: true,
      },
      { _id: 'e', data: { title: 'No status' } },
      { _id: 'f', data: { title: 'Wrong status', status: 'maybe' } },
      { _id: 'g', data: { title: '  ', status: 'shipped' } },
      { _id: 'h', data: null },
    ]);
    expect(roadmap.planned.map((i) => i.id)).toEqual(['a', 'b']);
    expect(roadmap.planned[0].summary).toBe('Captions that fit 9:16 & 1:1.');
    expect(roadmap['in-progress'].map((i) => i.title)).toEqual(['Brand kits']);
    expect(roadmap.shipped).toEqual([]);
  });
});

describe('plainText', () => {
  it('drops tags and Markdown marks', () => {
    expect(plainText('**Bold** and `code`')).toBe('Bold and code');
    expect(plainText(42)).toBe('');
  });
});
