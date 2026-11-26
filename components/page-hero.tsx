type PageHeroProps = { eyebrow: string; title: string; accent?: string; description: string };

export function PageHero({ eyebrow, title, accent, description }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <p className="eyebrow eyebrow-light">{eyebrow}</p>
        <h1>{title}{accent ? <><br /><span>{accent}</span></> : null}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
