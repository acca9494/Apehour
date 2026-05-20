import type { PropsWithChildren, ReactNode } from "react";

type SectionHeadingProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  action?: ReactNode;
}>;

export function SectionHeading({ eyebrow, title, children, action }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {children ? <p className="section-heading__copy">{children}</p> : null}
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  );
}
