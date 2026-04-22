import { cn } from "@/lib/utils";

export interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  description?: React.ReactNode;
  ctaText?: string;
  backgroundImage?: string;
  onCta?: () => void;
}

export function HeroSection({
  eyebrow,
  heading,
  description,
  ctaText,
  backgroundImage,
  onCta,
  className,
  ...rest
}: HeroSectionProps) {
  return (
    <section data-slot="hero-section" className={cn("ct-hero", className)} {...rest}>
      {backgroundImage && <img className="bg" src={backgroundImage} alt="" aria-hidden />}
      <div className="grad-top" aria-hidden />
      <div className="grad-bot" aria-hidden />
      <div data-slot="hero-section-content" className="ct-hero-content">
        {eyebrow && <span className="ct-eyebrow ct-eyebrow-dark">{eyebrow}</span>}
        <h1 data-slot="hero-section-heading">{heading}</h1>
        {description && <p className="desc">{description}</p>}
        {ctaText && (
          <button className="ct-btn ct-btn-outline-dark ct-btn-lg" onClick={onCta}>
            {ctaText}
          </button>
        )}
      </div>
    </section>
  );
}
