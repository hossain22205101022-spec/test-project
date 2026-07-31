import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  size?: 28 | 40 | 72;
}

export default function Avatar({ src, alt, size = 40 }: AvatarProps) {
  return (
    <Image
      src={src || "/default-avatar.svg"}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}
