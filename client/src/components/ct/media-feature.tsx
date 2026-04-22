import { cn } from "@/lib/utils";
import { ComboHeader } from "./combo-header";
import { WatchIcons, type WatchIconsProps } from "./watch-icons";

export interface MediaFeatureProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: { first: React.ReactNode; last: React.ReactNode };
  firstName: React.ReactNode;
  lastName: React.ReactNode;
  description?: React.ReactNode;
  orientation?: "left" | "right";
  imageSrc: string;
  imageSrc2?: string;
  imageSrc3?: string;
  watchLinks?: Omit<WatchIconsProps, "className">;
}

export function MediaFeature({
  eyebrow = { first: "Featured", last: "Episode" },
  firstName,
  lastName,
  description,
  orientation = "left",
  imageSrc,
  imageSrc2,
  imageSrc3,
  watchLinks,
  className,
  ...rest
}: MediaFeatureProps) {
  return (
    <div
      data-slot="media-feature"
      data-orientation={orientation}
      className={cn("ct-mf", orientation, className)}
      {...rest}
    >
      <div className={cn("ct-mf-inner", orientation === "right" && "right")}>
        <div data-slot="media-feature-images" className="ct-mf-images">
          <div className="big"><img src={imageSrc} alt="" /></div>
          {(imageSrc2 || imageSrc3) && (
            <div className="row">
              {imageSrc2 && <div><img src={imageSrc2} alt="" /></div>}
              {imageSrc3 && <div><img src={imageSrc3} alt="" /></div>}
            </div>
          )}
        </div>
        <div data-slot="media-feature-text" className="ct-mf-text">
          <ComboHeader first={eyebrow.first} last={eyebrow.last} size="xs" />
          <ComboHeader first={firstName} last={lastName} size="lg" />
          {description && <p className="desc">{description}</p>}
          {watchLinks && (
            <div style={{ paddingTop: 16 }}>
              <WatchIcons {...watchLinks} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
