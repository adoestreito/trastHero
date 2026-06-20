import Image from "next/image";
import Link from "next/link";

const sizeClass = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-28 w-28 sm:h-32 sm:w-32",
} as const;

type AppLogoProps = {
  size?: keyof typeof sizeClass;
  href?: string | null;
  className?: string;
  priority?: boolean;
};

export function AppLogo({
  size = "sm",
  href = "/",
  className = "",
  priority = false,
}: AppLogoProps) {
  const image = (
    <Image
      src="/logo.png"
      alt="TrastHero"
      width={256}
      height={256}
      priority={priority}
      className={`object-contain ${sizeClass[size]} ${className}`}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 rounded-full">
        {image}
      </Link>
    );
  }

  return image;
}
