/** A row of the local catalogue CSV (public/data/manifests.csv). */
export interface ManifestEntry {
  readonly id: string;
  readonly title: string;
  readonly provider: string;
  readonly manifestUrl: string;
  readonly iiifVersion?: IiifVersion;
  readonly description?: string;
  readonly tags: readonly string[];
}

export type IiifVersion = 2 | 3;

/** IIIF Image API service reference. */
export interface ImageService {
  readonly id: string;
  readonly version: IiifVersion;
}

/** The image painted on a canvas: either tiled (service) or a static file. */
export interface CanvasImage {
  readonly url?: string;
  readonly service?: ImageService;
  readonly width?: number;
  readonly height?: number;
}

/** A single page (IIIF Canvas) normalized across Presentation API versions. */
export interface CanvasPage {
  readonly id: string;
  readonly label: string;
  readonly width?: number;
  readonly height?: number;
  readonly image?: CanvasImage;
  readonly thumbnail?: string;
}

export interface MetadataEntry {
  readonly label: string;
  readonly value: string;
}

/** Presentation API v2/v3 manifest normalized to what the viewer needs. */
export interface NormalizedManifest {
  readonly id: string;
  readonly version: IiifVersion;
  readonly label: string;
  readonly summary?: string;
  readonly attribution?: string;
  readonly rights?: string;
  readonly metadata: readonly MetadataEntry[];
  readonly canvases: readonly CanvasPage[];
}
