import { Link } from "react-router-dom";
import { Github, Linkedin, Heart, Code2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/javierguerradevelop/", label: "LinkedIn" },
];

const footerLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Repos", path: "/repos" },
    { name: "Contact", path: "/contact" },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-border bg-background/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 text-xl font-display font-bold">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Code2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="gradient-text">Portfolio</span>
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            Building innovative solutions with modern technologies. Let's create something amazing together.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Quick Links</h3>
                        <nav className="flex flex-col gap-2">
                            {footerLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Connect</h3>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-all duration-200 hover:scale-105"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5 text-muted-foreground" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Bottom */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© {currentYear} All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> using C++, Go & React
                    </p>
                </div>
            </div>
        </footer>
    );
}
