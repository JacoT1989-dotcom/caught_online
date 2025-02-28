import Image from "next/image";

interface QuickViewImageProps {
  image: string;
  title: string;
}

export function QuickViewImage({ image, title }: QuickViewImageProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24">
        <Image
          src={image}
          alt={title}
          fill
          sizes="96px"
          className="object-cover rounded-lg"
          priority
        />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
      </div>
    </div>
  );
}
