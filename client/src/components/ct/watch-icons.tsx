import { cn } from "@/lib/utils";

export interface WatchIconsProps extends React.HTMLAttributes<HTMLDivElement> {
  youtube?: string;
  spotify?: string;
  apple?: string;
  label?: string;
}

export function WatchIcons({
  youtube,
  spotify,
  apple,
  label = "Watch:",
  className,
  ...rest
}: WatchIconsProps) {
  if (!youtube && !spotify && !apple) return null;
  return (
    <div data-slot="watch-icons" className={cn("ct-watch", className)} {...rest}>
      <span data-slot="watch-icons-label" className="label">{label}</span>
      <div data-slot="watch-icons-list" className="icons">
        {youtube && (
          <a href={youtube} aria-label="YouTube" target="_blank" rel="noreferrer">
            <i className="bx bxl-youtube" />
          </a>
        )}
        {spotify && (
          <a href={spotify} aria-label="Spotify" target="_blank" rel="noreferrer">
            <i className="bx bxl-spotify" />
          </a>
        )}
        {apple && (
          <a href={apple} aria-label="Apple Podcasts" target="_blank" rel="noreferrer">
            <i className="bx bxl-apple" />
          </a>
        )}
      </div>
    </div>
  );
}
