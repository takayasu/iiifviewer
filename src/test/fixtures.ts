export const v3Manifest = {
  '@context': 'http://iiif.io/api/presentation/3/context.json',
  id: 'https://example.org/iiif/book/manifest',
  type: 'Manifest',
  label: { en: ['Example Book'], ja: ['サンプル図書'] },
  summary: { en: ['A <b>short</b> summary'] },
  requiredStatement: { label: { en: ['Attribution'] }, value: { en: ['Example Library'] } },
  rights: 'http://creativecommons.org/licenses/by/4.0/',
  metadata: [
    { label: { en: ['Author'] }, value: { none: ['Anonymous'] } },
    { label: { en: ['Empty'] }, value: { en: [] } },
  ],
  items: [
    {
      id: 'https://example.org/iiif/book/canvas/p1',
      type: 'Canvas',
      label: { none: ['p. 1'] },
      width: 1000,
      height: 1500,
      items: [
        {
          id: 'https://example.org/iiif/book/page/p1/1',
          type: 'AnnotationPage',
          items: [
            {
              id: 'https://example.org/iiif/book/annotation/p1',
              type: 'Annotation',
              motivation: 'painting',
              body: {
                id: 'https://example.org/iiif/image/p1/full/max/0/default.jpg',
                type: 'Image',
                format: 'image/jpeg',
                width: 1000,
                height: 1500,
                service: [{ id: 'https://example.org/iiif/image/p1', type: 'ImageService3', profile: 'level1' }],
              },
              target: 'https://example.org/iiif/book/canvas/p1',
            },
          ],
        },
      ],
    },
    {
      id: 'https://example.org/iiif/book/canvas/p2',
      type: 'Canvas',
      width: 800,
      height: 600,
      thumbnail: [{ id: 'https://example.org/thumbs/p2.jpg', type: 'Image' }],
      items: [
        {
          id: 'https://example.org/iiif/book/page/p2/1',
          type: 'AnnotationPage',
          items: [
            {
              id: 'https://example.org/iiif/book/annotation/p2',
              type: 'Annotation',
              motivation: 'painting',
              body: { id: 'https://example.org/static/p2.png', type: 'Image', format: 'image/png' },
            },
          ],
        },
      ],
    },
    { id: 'https://example.org/iiif/book/range/r1', type: 'Range' },
  ],
};

export const v2Manifest = {
  '@context': 'http://iiif.io/api/presentation/2/context.json',
  '@id': 'https://example.org/iiif/v2/manifest.json',
  '@type': 'sc:Manifest',
  label: [
    { '@value': 'Map of Izumi', '@language': 'en' },
    { '@value': '和泉国絵図', '@language': 'ja' },
  ],
  description: 'An Edo-period map',
  attribution: '国立国会図書館',
  license: 'https://creativecommons.org/publicdomain/mark/1.0/',
  metadata: [{ label: 'Date', value: '1700' }],
  sequences: [
    {
      '@type': 'sc:Sequence',
      canvases: [
        {
          '@id': 'https://example.org/iiif/v2/canvas/1',
          '@type': 'sc:Canvas',
          label: '1',
          width: 4000,
          height: 3000,
          images: [
            {
              '@type': 'oa:Annotation',
              motivation: 'sc:painting',
              resource: {
                '@id': 'https://example.org/iiif/v2/image/1/full/full/0/default.jpg',
                '@type': 'dctypes:Image',
                width: 4000,
                height: 3000,
                service: {
                  '@context': 'http://iiif.io/api/image/2/context.json',
                  '@id': 'https://example.org/iiif/v2/image/1',
                  profile: 'http://iiif.io/api/image/2/level1.json',
                },
              },
              on: 'https://example.org/iiif/v2/canvas/1',
            },
          ],
        },
      ],
    },
  ],
};
