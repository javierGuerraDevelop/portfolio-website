import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared";

interface TicketInfo {
    plate: string;
    arrival: string;
    expiration_time: string;
    id: string;
    token: string;
}

interface RegistrationResult {
    name: string;
    success: boolean;
    message: string;
    ticket?: TicketInfo;
    passUrl?: string;
}

export function ParkingPage() {
    const [guests, setGuests] = useState<string[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [result, setResult] = useState<RegistrationResult | null>(null);

    useEffect(() => {
        fetch("/api/parking/guests")
            .then((res) => res.json())
            .then((data) => setGuests(data.guests ?? []))
            .catch(() => setGuests([]));
    }, []);

    async function register(name: string) {
        setResult(null);
        setLoading(name);

        try {
            const resp = await fetch(`/api/parking/register/${encodeURIComponent(name)}`, {
                method: "POST",
            });
            const data = await resp.json();

            if (resp.ok) {
                try {
                    const hoa = JSON.parse(data.hoa_body);
                    const ticket = hoa.ticket as TicketInfo;
                    const passUrl = `https://melrosepoint.parkrmg.com/?ticket=${ticket.id}&token=${ticket.token}`;
                    setResult({
                        name,
                        success: true,
                        message: `Registered ${name}`,
                        ticket,
                        passUrl,
                    });
                } catch {
                    setResult({
                        name,
                        success: true,
                        message: `Registered ${name}\n\n${data.hoa_body}`,
                    });
                }
            } else {
                setResult({
                    name,
                    success: false,
                    message: `Failed for ${name}\n\nHTTP ${resp.status}\n${JSON.stringify(data)}`,
                });
            }
        } catch (err) {
            setResult({
                name,
                success: false,
                message: `Network error: ${err instanceof Error ? err.message : String(err)}`,
            });
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="container mx-auto px-4 py-16 md:py-24">
                <SectionHeader title="Parking for Leo" subtitle="Select a guest to register their vehicle" />

                <div className="flex flex-wrap gap-4 justify-center max-w-2xl mx-auto">
                    {guests.map((name) => (
                        <Button
                            key={name}
                            variant="gradient"
                            size="xl"
                            onClick={() => register(name)}
                            disabled={loading !== null}
                        >
                            {loading === name ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                name
                            )}
                        </Button>
                    ))}
                </div>

                {result && (
                    <div className="max-w-2xl mx-auto mt-12">
                        {result.success ? (
                            <Card className="bg-green-500/10 border-green-500/20">
                                <CardContent className="pt-6">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                                        </div>
                                        {result.ticket ? (
                                            <>
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    Registered {result.name}
                                                </h3>
                                                <div className="space-y-1 text-muted-foreground">
                                                    <p>Plate: {result.ticket.plate}</p>
                                                    <p>Arrival: {result.ticket.arrival}</p>
                                                    <p>Expiration: {result.ticket.expiration_time}</p>
                                                </div>
                                                <Button variant="outline" size="lg" asChild>
                                                    <a
                                                        href={result.passUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="w-4 h-4 mr-2" />
                                                        View Parking Pass
                                                    </a>
                                                </Button>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground whitespace-pre-wrap">
                                                {result.message}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-destructive/10 border-destructive/20">
                                <CardContent className="pt-6">
                                    <p className="text-destructive-foreground whitespace-pre-wrap break-words">
                                        {result.message}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
