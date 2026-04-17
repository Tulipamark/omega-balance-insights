import { cn } from "@/lib/utils";

type InsideBalanceLogoProps = {
  alt?: string;
  className?: string;
  imageClassName?: string;
  variant?: "full" | "mark";
};

const insideBalanceLogoSrc = `${import.meta.env.BASE_URL}insidebalance-logo.png`;

const InsideBalanceLogo = ({
  alt = "InsideBalance",
  className,
  imageClassName,
  variant = "full",
}: InsideBalanceLogoProps) => {
  if (variant === "mark") {
    return (
      <span
        className={cn(
          "block h-20 w-20 overflow-hidden sm:h-24 sm:w-24 md:h-28 md:w-28",
          className,
        )}
      >
        <img
          src={insideBalanceLogoSrc}
          alt={alt}
          className={cn(
            "pointer-events-none h-[168%] max-w-none -translate-x-[18%] -translate-y-[2%] select-none",
            imageClassName,
          )}
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center overflow-visible", className)}>
      <img
        src={insideBalanceLogoSrc}
        alt={alt}
        className={cn("block h-full max-w-none w-auto", imageClassName)}
      />
    </span>
  );
};

export default InsideBalanceLogo;
