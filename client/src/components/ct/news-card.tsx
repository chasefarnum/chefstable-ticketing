import { cn } from "@/lib/utils";

export interface NewsCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  date: string;
  imageSrc: string;
}

export function NewsCard({
  title,
  date,
  imageSrc,
  className,
  ...rest
}: NewsCardProps) {
  return (
    <article
      data-slot="news-card"
      className={cn("ct-news", className)}
      role={rest.onClick ? "button" : undefined}
      tabIndex={rest.onClick ? 0 : undefined}
      {...rest}
    >
      <div data-slot="news-card-image" className="ct-news-img">
        <img src={imageSrc} alt="" />
      </div>
      <time data-slot="news-card-date">{date}</time>
      <h3 data-slot="news-card-title">{title}</h3>
    </article>
  );
}
