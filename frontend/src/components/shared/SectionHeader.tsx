import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
    align?: "left" | "center";
}

export function SectionHeader({ title, subtitle, className, align = "center" }: SectionHeaderProps) {
    return (
        <div className={cn("space-y-4 mb-12", align === "center" && "text-center", className)}>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
                <span className="gradient-text">{title}</span>
            </h2>
            {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{subtitle}</p>}
        </div>
    );
}
