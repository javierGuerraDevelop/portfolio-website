import { Link } from "react-router-dom";
import { ArrowRight, Github, Linkedin, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/shared";
import { useApi } from "@/hooks";
import { Profile } from "@/types";

export function HomePage() {
    const { data: profile } = useApi<Profile>("/api/profile");

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center">
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Content */}
                    <div className="space-y-8 order-2 lg:order-1">
                        {/* Greeting */}
                        <div className="space-y-4">
                            <p className="text-primary font-mono text-sm md:text-base opacity-0 animate-fade-in">👋 Hello, I'm</p>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight opacity-0 animate-fade-in animation-delay-150">
                                <span className="gradient-text">{profile?.name || "Javier Guerra"}</span>
                            </h1>
                            <h2 className="text-xl md:text-2xl text-muted-foreground font-medium opacity-0 animate-fade-in animation-delay-300">
                                {profile?.title || "Software Engineer"}
                            </h2>
                        </div>

                        {/* Bio */}
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-xl opacity-0 animate-fade-in animation-delay-450">
                            {profile?.shortBio ||
                                "Software engineer passionate about low-level, high-performance computing with modern C++. I build low latency software with C++ and backend services with Golang."}
                        </p>

                        {/* Location & Email */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground opacity-0 animate-fade-in animation-delay-450">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-primary" />
                                {profile?.location || "United States"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-primary" />
                                {profile?.email || "guerrajavierswe@att.net"}
                            </span>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4 opacity-0 animate-fade-in animation-delay-600">
                            <Button asChild size="lg" variant="gradient">
                                <Link to="/repos">
                                    View My Work
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link to="/contact">Get in Touch</Link>
                            </Button>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-3 pt-4 opacity-0 animate-fade-in animation-delay-600">
                            {profile?.socialLinks?.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-11 h-11 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 flex items-center justify-center transition-all duration-200 hover:scale-105 group"
                                    aria-label={social.name}
                                >
                                    {social.icon === "github" && (
                                        <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                    {social.icon === "linkedin" && (
                                        <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                </a>
                            )) || (
                                <>
                                    <a
                                        href="https://github.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-11 h-11 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 flex items-center justify-center transition-all duration-200 hover:scale-105 group"
                                        aria-label="GitHub"
                                    >
                                        <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/in/javierguerradevelop/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-11 h-11 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 flex items-center justify-center transition-all duration-200 hover:scale-105 group"
                                        aria-label="LinkedIn"
                                    >
                                        <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Profile Image */}
                    <div className="flex justify-center lg:justify-end order-1 lg:order-2 opacity-0 animate-scale-in animation-delay-300">
                        <div className="relative">
                            {/* Decorative elements */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl animate-pulse-glow" />
                            <ProfileImage src="/images/profile.jpg" alt={profile?.name || "Profile"} size="xl" className="relative z-10" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
