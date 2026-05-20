import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEventHandler, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type BaseProps = PropsWithChildren<{
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "dark";
}>;

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

type LinkButtonProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  };

export function ClayButton({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button className={cn("clay-button", `clay-button--${variant}`, className)} type={type} {...props}>
      {children}
    </button>
  );
}

export function ClayLink({ children, className, variant = "primary", href, onClick }: LinkButtonProps) {
  return (
    <Link className={cn("clay-button", `clay-button--${variant}`, className)} href={href} onClick={onClick}>
      {children}
    </Link>
  );
}
