import type { ReactNode } from "react";
export function Panel({children,className="",label}:{children:ReactNode;className?:string;label?:string}){return <section className={"panel "+className} aria-label={label}>{children}</section>;}
export function Tag({children,tone="blue"}:{children:ReactNode;tone?:"blue"|"amber"|"green"|"muted"}){return <span className={"tag "+tone}>{children}</span>;}
export function SectionHeading({title,children}:{title:string;children?:ReactNode}){return <div className="section-heading"><h2>{title}</h2>{children}</div>;}
