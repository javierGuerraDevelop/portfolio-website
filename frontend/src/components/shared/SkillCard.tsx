import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skill } from "@/types";

interface SkillCardProps {
    skill: Skill;
    index: number;
}

export function SkillCard({ skill, index }: SkillCardProps) {
    return (
        <Card
            className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display gradient-text">{skill.category}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {skill.items.map((item) => (
                        <Badge
                            key={item}
                            variant="secondary"
                            className="transition-all duration-200 hover:bg-primary/20 hover:text-primary"
                        >
                            {item}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
