import { cn } from "@/lib/utils";

export interface ExperienceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  imageSrc: string;
  eyebrow?: string;
}

export function ExperienceCard({
  title,
  description,
  imageSrc,
  eyebrow = "Experience",
  className,
  ...rest
}: ExperienceCardProps) {
  return (
    <div
      data-slot="experience-card"
      className={cn("ct-exp", className)}
      role={rest.onClick ? "button" : undefined}
      tabIndex={rest.onClick ? 0 : undefined}
      {...rest}
    >
      <img src={imageSrc} alt={title} />
      <div data-slot="experience-card-hover" className="hover">
        <span className="eye">{eyebrow}</span>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      <div data-slot="experience-card-label" className="label">{title}</div>
    </div>
  );
}
