import { useState, useMemo } from "react";
import { Search, Filter, FolderGit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader, RepoCard, ErrorMessage } from "@/components/shared";
import { useApi } from "@/hooks";
import { Repository } from "@/types";

const LANGUAGE_FILTERS = ["All", "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java"];

export function ReposPage() {
    const { data: repos, loading, error, refetch } = useApi<Repository[]>("/api/repos");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("All");

    // Get unique languages from repos
    const availableLanguages = useMemo(() => {
        if (!repos) return LANGUAGE_FILTERS;
        const languages = new Set(repos.map((repo) => repo.language).filter((lang): lang is string => lang !== null));
        return ["All", ...Array.from(languages).sort()];
    }, [repos]);

    // Filter repos based on search and language
    const filteredRepos = useMemo(() => {
        if (!repos) return [];

        return repos.filter((repo) => {
            const matchesSearch =
                repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.topics?.some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesLanguage = selectedLanguage === "All" || repo.language === selectedLanguage;

            return matchesSearch && matchesLanguage;
        });
    }, [repos, searchQuery, selectedLanguage]);

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16">
                <SectionHeader title="GitHub Repositories" subtitle="Explore my open source projects and contributions" />
                <ErrorMessage message={error} onRetry={refetch} className="mt-12" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <SectionHeader title="GitHub Repositories" subtitle="Explore my open source projects and contributions" />

            {/* Filters */}
            <div className="mb-8 space-y-4">
                {/* Search */}
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search repositories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Language Filter */}
                <div className="flex flex-wrap justify-center gap-2">
                    {availableLanguages.slice(0, 10).map((language) => (
                        <Button
                            key={language}
                            variant={selectedLanguage === language ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedLanguage(language)}
                            className="transition-all duration-200"
                        >
                            {language}
                        </Button>
                    ))}
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-center text-sm text-muted-foreground">
                        Showing {filteredRepos.length} of {repos?.length || 0} repositories
                    </p>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-4 p-6 border border-border rounded-xl">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <div className="flex justify-between pt-4 border-t border-border">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Repos Grid */}
            {!loading && filteredRepos.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRepos.map((repo, index) => (
                        <div
                            key={repo.id}
                            className="opacity-0 animate-fade-in-up"
                            style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                        >
                            <RepoCard repo={repo} />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredRepos.length === 0 && repos && repos.length > 0 && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Filter className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No matching repositories</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedLanguage("All");
                        }}
                    >
                        Clear Filters
                    </Button>
                </div>
            )}

            {/* No Repos State */}
            {!loading && (!repos || repos.length === 0) && !error && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <FolderGit2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
                    <p className="text-muted-foreground">Check back later for new projects</p>
                </div>
            )}
        </div>
    );
}
