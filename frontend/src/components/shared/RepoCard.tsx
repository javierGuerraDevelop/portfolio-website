import { Star, GitFork, ExternalLink, Circle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Repository } from '@/types';
import { getLanguageColor } from '@/lib/utils';

interface RepoCardProps {
    repo: Repository;
}

export function RepoCard({ repo }: RepoCardProps) {
    return (
        <Card className='group h-full flex flex-col bg-card/50 hover:bg-card/80 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1'>
            <CardHeader className='pb-3'>
                <div className='flex items-start justify-between gap-2'>
                    <h3 className='font-display font-semibold text-lg group-hover:text-primary transition-colors truncate'>
                        {repo.name}
                    </h3>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity'
                        asChild
                    >
                        <a
                            href={repo.html_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label={`View ${repo.name} on GitHub`}
                        >
                            <ExternalLink className='w-4 h-4' />
                        </a>
                    </Button>
                </div>
                <p className='text-sm text-muted-foreground line-clamp-2 min-h-[40px]'>
                    {repo.description || 'No description available'}
                </p>
            </CardHeader>

            <CardContent className='flex-1 pb-3'>
                {repo.topics && repo.topics.length > 0 && (
                    <div className='flex flex-wrap gap-1.5'>
                        {repo.topics.slice(0, 4).map((topic) => (
                            <Badge key={topic} variant='ghost' className='text-xs'>
                                {topic}
                            </Badge>
                        ))}
                        {repo.topics.length > 4 && (
                            <Badge variant='ghost' className='text-xs'>
                                +{repo.topics.length - 4}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className='pt-3 border-t border-border/50'>
                <div className='flex items-center justify-between w-full text-sm text-muted-foreground'>
                    <div className='flex items-center gap-4'>
                        {repo.language && (
                            <span className='flex items-center gap-1.5'>
                                <Circle
                                    className='w-3 h-3 fill-current'
                                    style={{ color: getLanguageColor(repo.language) }}
                                />
                                {repo.language}
                            </span>
                        )}
                        <span className='flex items-center gap-1'>
                            <Star className='w-4 h-4' />
                            {repo.stargazers_count}
                        </span>
                        <span className='flex items-center gap-1'>
                            <GitFork className='w-4 h-4' />
                            {repo.forks_count}
                        </span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
