import React from 'react';
import { OcopMascotKey, OcopProductKey } from '../data/ocopData';

export type AnyMascotKey = OcopMascotKey | 'otter' | 'turtle';

const MASCOT_IMAGES: Record<AnyMascotKey, { src: string; alt: string }> = {
  bee: { src: '/image/mascot-mat-ong.png', alt: 'Mật ong – Con Ong' },
  caterpillar: { src: '/image/mascot-mang-cau.png', alt: 'Mãng cầu – Con Sâu' },
  squirrel: { src: '/image/mascot-banh-trang.png', alt: 'Bánh tráng – Con Sóc' },
  shrimp: { src: '/image/mascot-muoi-tom.png', alt: 'Muối tôm – Con Tôm' },
  swallow: { src: '/image/mascot-yen-sao.png', alt: 'Yến sào – Con Yến' },
  dragon: { src: '/image/mascot-nhang.png', alt: 'Nhang – Con Rồng' },
  otter: { src: '/image/animal-otter.png', alt: 'Rái Cá Nhỏ' },
  turtle: { src: '/image/animal-turtle.png', alt: 'Rùa Nón Lá' }
};

export function MascotAvatar({
  mascot,
  className = 'w-14 h-14'
}: {
  mascot: AnyMascotKey;
  className?: string;
}) {
  const info = MASCOT_IMAGES[mascot] || MASCOT_IMAGES.bee;
  const objectFit = className.includes('object-') ? '' : 'object-contain';
  return (
    <img
      src={info.src}
      alt={info.alt}
      referrerPolicy="no-referrer"
      className={`${className} ${objectFit} rounded-xl select-none`}
    />
  );
}

const PRODUCT_IMAGES: Record<
  OcopProductKey,
  { src: string; alt: string }
> = {
  honey: {
    src: '/image/mascot-mat-ong.png',
    alt: 'Mật ong Bảo An Tây Ninh – Con Ong'
  },
  custardapple: {
    src: '/image/mascot-mang-cau.png',
    alt: 'Mãng cầu Bà Đen Tây Ninh – Con Sâu'
  },
  ricepaper: {
    src: '/image/mascot-banh-trang.png',
    alt: 'Bánh tráng Tây Ninh – Con Sóc'
  },
  shrimpsalt: {
    src: '/image/mascot-muoi-tom.png',
    alt: 'Muối tôm Thắng Lợi Tây Ninh – Con Tôm'
  },
  birdsnest: {
    src: '/image/mascot-yen-sao.png',
    alt: 'Yến sào Yến Loan Tây Ninh – Con Yến'
  },
  incense: {
    src: '/image/mascot-nhang.png',
    alt: 'Nhang Tây Ninh – Con Rồng'
  }
};

export function ProductIllustration({
  productKey,
  className = 'w-full h-48'
}: {
  productKey: OcopProductKey;
  className?: string;
}) {
  const info = PRODUCT_IMAGES[productKey] || PRODUCT_IMAGES.honey;
  const objectFit = className.includes('object-') ? '' : 'object-contain';
  return (
    <img
      src={info.src}
      alt={info.alt}
      referrerPolicy="no-referrer"
      className={`${className} ${objectFit} block`}
    />
  );
}

export function TayNinhMapBackground() {
  return (
    <img
      src="/image/ocop-map-bg.jpg"
      alt="Bản đồ OCOP Tây Ninh"
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover object-bottom select-none pointer-events-none block"
    />
  );
}
