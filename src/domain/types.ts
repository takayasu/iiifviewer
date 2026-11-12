/** A row of the local catalogue CSV (public/data/manifests.csv). */
export interface ManifestEntry {
  readonly id: string;
  readonly title: string;
  readonly provider: string;
  readonly manifestUrl: string;
  readonly iiifVersion?: IiifVersion;
  readonly description?: string;
  readonly tags: readonly string[];
  /** Small preview image shown on catalogue cards. */
  readonly thumbnailUrl?: string;
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

export interface MetadataEntry {
  readonly label: string;
  readonly value: string;
}

/** homepage (v2: related), seeAlso and rendering references. */
export type ResourceLinkKind = 'homepage' | 'seeAlso' | 'rendering';

export interface ResourceLink {
  readonly kind: ResourceLinkKind;
  readonly label: string;
  readonly url: string;
  readonly format?: string;
}

/** Descriptive properties shared by Manifests and Canvases (v2/v3 normalized). */
export interface DescriptiveInfo {
  readonly summary?: string;
  readonly attribution?: string;
  readonly rights?: string;
  readonly navDate?: string;
  readonly metadata: readonly MetadataEntry[];
  readonly links: readonly ResourceLink[];
}

/** A single page (IIIF Canvas) normalized across Presentation API versions. */
export interface CanvasPage extends DescriptiveInfo {
  readonly id: string;
  readonly label: string;
  readonly width?: number;
  readonly height?: number;
  readonly image?: CanvasImage;
  readonly thumbnail?: string;
}

/** Presentation API v2/v3 manifest normalized to what the viewer needs. */
export interface NormalizedManifest extends DescriptiveInfo {
  readonly id: string;
  readonly version: IiifVersion;
  readonly label: string;
  /** v3 `provider` agents' labels (v2 has no equivalent). */
  readonly provider?: string;
  readonly viewingDirection?: string;
  /** Number of top-level Ranges (table of contents entries). */
  readonly structureCount: number;
  readonly canvases: readonly CanvasPage[];
}
