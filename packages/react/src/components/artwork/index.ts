export * as Artwork from './artwork.tsx';
export type {
  ArtProps as ArtworkArtProps,
  CollageProps as ArtworkCollageProps,
  GlyphProps as ArtworkGlyphProps,
  ImageProps as ArtworkImageProps,
  RootOwnProps as ArtworkRootOwnProps,
  RootProps as ArtworkRootProps,
} from './artwork.tsx';
export {
  ARTWORK_FACES,
  artworkCompositions,
  artworkPalettes,
  artworkSpec,
  artworkSvg,
} from './generate.ts';
export type { ArtworkPalette, ArtworkSpec } from './generate.ts';
