'use client';

import Image, { type ImageProps } from 'next/image';
import { blurFor } from '@/lib/blur.generated';

type Props = Omit<ImageProps, 'placeholder' | 'blurDataURL'>;

/**
 * next/image con el LQIP que generó scripts/fetch-assets.mjs. Si una imagen no
 * tiene placeholder se degrada sola en vez de romper el render.
 */
export default function Img({ src, alt, ...rest }: Props) {
  const blur = typeof src === 'string' ? blurFor(src) : undefined;
  return (
    <Image
      src={src}
      alt={alt}
      {...(blur ? { placeholder: 'blur' as const, blurDataURL: blur } : {})}
      {...rest}
    />
  );
}
