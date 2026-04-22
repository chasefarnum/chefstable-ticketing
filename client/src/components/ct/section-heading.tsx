import { cn } from "@/lib/utils";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  theme?: "light" | "dark";
}

export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = "left",
  theme = "light",
  className,
  ...rest
}: SectionHeadingProps) {
  return (
    <div
      data-slot="section-heading"
      data-align={align}
      data-theme={theme}
      className={cn(
        "ct-sh",
        align === "center" && "center",
        theme === "dark" && "dark",
        className,
      )}
      {...rest}
    >
      {eyebrow && (
        <span className={cn("ct-eyebrow", theme === "dark" && "ct-eyebrow-dark")}>
          {eyebrow}
        </span>
      )}
      <h2 data-slot="section-heading-title">{heading}</h2>
      {description && <p className="desc">{description}</p>}
    </div>
  );
}
