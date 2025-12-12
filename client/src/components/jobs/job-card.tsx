/** @format */

import {
    Heart,
    MapPin,
    Clock,
    GraduationCap,
    User,
    Calendar,
    Eye,
    TrendingUp,
    Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { JobWithCompany } from "@shared/schema";

interface JobCardProps {
    job: JobWithCompany;
    isFeatured?: boolean;
    onSaveToggle?: (jobId: number, isSaved: boolean) => void;
    isSaved?: boolean;
    className?: string;
}

export default function JobCard({
    job,
    isFeatured = false,
    onSaveToggle,
    isSaved = false,
    className = "",
}: JobCardProps) {
    const [saved, setSaved] = useState(isSaved);

    // Determine if this is a premium or pro job
    const isPremium = job.isFeatured || isFeatured;
    const isPro = false; // Pro 기능은 아직 구현되지 않음

    const handleSaveToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const newSavedState = !saved;
        setSaved(newSavedState);
        onSaveToggle?.(job.id, newSavedState);
    };

    const formatSalary = (min?: number | null, max?: number | null) => {
        if (!min && !max) return "협의";
        if (min && max) {
            return `${(min / 10000000).toFixed(0)}-${(max / 10000000).toFixed(
                0
            )}천만원`;
        }
        if (min) return `${(min / 10000000).toFixed(0)}천만원 이상`;
        if (max) return `${(max / 10000000).toFixed(0)}천만원 이하`;
        return "협의";
    };

    const getExperienceLabel = (experience: string) => {
        const labels: Record<string, string> = {
            entry: "신입 (0-2년)",
            junior: "주니어 (3-5년)",
            mid: "미드 (3-7년)",
            senior: "시니어 (6-10년)",
            expert: "전문가 (10년+)",
        };
        return labels[experience] || experience;
    };

    const getJobTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            full_time: "정규직",
            contract: "계약직",
            freelance: "프리랜서",
            internship: "인턴십",
        };
        return labels[type] || type;
    };

    const getTimeAgo = (date: Date | string | null) => {
        if (!date) return "";
        const now = new Date();
        const jobDate = new Date(date);
        const diffTime = Math.abs(now.getTime() - jobDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "1일 전";
        if (diffDays < 7) return `${diffDays}일 전`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)}주 전`;
        return `${Math.ceil(diffDays / 30)}개월 전`;
    };

    const generateCompanyLogo = (name: string) => {
        const colors = [
            "from-blue-500 to-blue-600",
            "from-green-500 to-green-600",
            "from-purple-500 to-purple-600",
            "from-red-500 to-red-600",
            "from-orange-500 to-orange-600",
            "from-cyan-500 to-cyan-600",
            "from-pink-500 to-pink-600",
            "from-indigo-500 to-indigo-600",
        ];
        const colorIndex = name.length % colors.length;
        const initials = name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

        return { color: colors[colorIndex], initials };
    };

    const logo = generateCompanyLogo(job.company?.name || "Unknown Company");

    return (
        <Link href={`/user/jobs/${job.id}`}>
            <Card
                className={`group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out ${
                    className.includes("bg-gradient-to-br from-gray-50") ||
                    className.includes("bg-gradient-to-br from-gray-800")
                        ? "hover:scale-[1.08] hover:-translate-y-4 hover:rotate-1 shadow-2xl shadow-slate-500/20 hover:shadow-3xl hover:shadow-slate-500/30" // Pro Jobs silver styling
                        : className.includes("bg-white") ||
                          className.includes("bg-gray-900")
                        ? "hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300" // Latest Jobs clean white
                        : isPremium
                        ? "border-3 border-amber-300/70 dark:border-amber-700/70 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/20 shadow-2xl shadow-amber-500/25 hover:shadow-3xl hover:shadow-amber-500/40 hover:border-amber-400/90 dark:hover:border-amber-600/90 hover:scale-[1.1] hover:-translate-y-6 hover:rotate-[-1deg] backdrop-blur-sm"
                        : isPro
                        ? "border-3 border-slate-300/60 dark:border-slate-600/60 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 dark:from-slate-800 dark:via-gray-800 dark:to-zinc-900 shadow-xl shadow-slate-500/15 hover:shadow-2xl hover:shadow-slate-500/25 hover:border-slate-400/80 dark:hover:border-slate-500/80 hover:scale-[1.08] hover:-translate-y-4 hover:rotate-1"
                        : "hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300"
                } ${className}`}
            >
                {/* Premium Gold Shimmer */}
                {isPremium && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200 ease-out"></div>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute top-4 left-6 w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                            <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse delay-200"></div>
                            <div className="absolute bottom-6 left-12 w-1 h-1 bg-orange-400 rounded-full animate-ping delay-400"></div>
                            <div className="absolute bottom-12 right-6 w-1.5 h-1.5 bg-amber-300 rounded-full animate-bounce delay-600"></div>
                        </div>
                    </>
                )}

                {/* Pro Silver Shimmer */}
                {(isPro && !isPremium) ||
                    (className.includes("bg-gradient-to-br from-gray-50") && (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-300/25 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-600">
                                <div className="absolute top-5 left-7 w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"></div>
                                <div className="absolute top-10 right-10 w-1 h-1 bg-gray-400 rounded-full animate-ping delay-300"></div>
                                <div className="absolute bottom-8 left-14 w-1 h-1 bg-zinc-400 rounded-full animate-bounce delay-500"></div>
                            </div>
                        </>
                    ))}

                {/* Regular White Shimmer */}
                {!isPremium &&
                    !isPro &&
                    !className.includes("bg-gradient-to-br from-gray-50") && (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-800 ease-out"></div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
                                <div className="absolute top-6 left-8 w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
                                <div className="absolute bottom-8 right-8 w-1 h-1 bg-indigo-300 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </>
                    )}

                {/* Enhanced Premium overlay with luxury glow */}
                {isPremium && (
                    <>
                        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-400/40 to-orange-500/50 rounded-bl-full blur-md animate-pulse"></div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-400/50 to-amber-500/60 rounded-bl-full"></div>
                        <div
                            className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-300/30 to-orange-400/40 rounded-bl-full animate-spin"
                            style={{ animationDuration: "8s" }}
                        ></div>
                        <div className="absolute top-2 right-2">
                            <Sparkles className="w-5 h-5 text-amber-600 animate-bounce drop-shadow-lg" />
                        </div>
                        <div className="absolute top-1 right-1 w-8 h-8 bg-gradient-to-br from-yellow-400/25 to-amber-400/25 rounded-full animate-ping"></div>
                        <div className="absolute top-6 right-6 w-3 h-3 bg-gradient-to-br from-orange-300/40 to-yellow-300/40 rounded-full animate-pulse delay-1000"></div>
                    </>
                )}

                {/* Enhanced Pro overlay with silver glow */}
                {(isPro && !isPremium) ||
                    (className.includes("bg-gradient-to-br from-gray-50") && (
                        <>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-400/30 to-zinc-500/40 rounded-bl-full blur-md animate-pulse delay-300"></div>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-400/40 to-slate-500/50 rounded-bl-full"></div>
                            <div
                                className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-zinc-300/25 to-gray-400/35 rounded-bl-full animate-spin"
                                style={{ animationDuration: "10s" }}
                            ></div>
                            <div className="absolute top-2 right-2">
                                <TrendingUp className="w-5 h-5 text-slate-700 dark:text-slate-300 animate-pulse delay-500 drop-shadow-md" />
                            </div>
                            <div className="absolute top-1 right-1 w-6 h-6 bg-gradient-to-br from-slate-400/20 to-gray-400/20 rounded-full animate-ping delay-700"></div>
                            <div className="absolute top-5 right-5 w-2 h-2 bg-gradient-to-br from-zinc-300/30 to-slate-300/30 rounded-full animate-bounce delay-900"></div>
                        </>
                    ))}

                <CardContent className="relative p-3 lg:p-4 h-full flex flex-col">
                    {/* Header Section - Compact for 4-column layout */}
                    <div className="flex items-start gap-3 mb-3">
                        {/* Company Logo - Enhanced for each tier */}
                        <div
                            className={`relative w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br ${
                                logo.color
                            } rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0 overflow-hidden transition-all duration-500 ${
                                isPremium
                                    ? "group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-xl group-hover:shadow-amber-500/30 border-2 border-amber-300/50"
                                    : (isPro && !isPremium) ||
                                      className.includes(
                                          "bg-gradient-to-br from-gray-50"
                                      )
                                    ? "group-hover:scale-115 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-slate-500/25 border-2 border-slate-300/40"
                                    : "group-hover:scale-110 group-hover:shadow-md border border-gray-200"
                            }`}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 ${
                                    isPremium
                                        ? "via-amber-200/40 translate-x-[-100%] group-hover:translate-x-[100%]"
                                        : (isPro && !isPremium) ||
                                          className.includes(
                                              "bg-gradient-to-br from-gray-50"
                                          )
                                        ? "via-slate-200/30 translate-x-[-100%] group-hover:translate-x-[100%]"
                                        : "via-white/20 translate-x-[-100%] group-hover:translate-x-[100%]"
                                }`}
                            ></div>
                            <span className="relative z-10 drop-shadow-sm">
                                {logo.initials}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Title - Enhanced for each tier */}
                            <h3
                                className={`text-sm lg:text-base font-semibold transition-all duration-300 line-clamp-2 leading-tight mb-1 ${
                                    isPremium
                                        ? "text-amber-900 dark:text-amber-100 group-hover:text-amber-700 dark:group-hover:text-amber-200 drop-shadow-sm"
                                        : (isPro && !isPremium) ||
                                          className.includes(
                                              "bg-gradient-to-br from-gray-50"
                                          )
                                        ? "text-slate-800 dark:text-slate-200 group-hover:text-slate-700 dark:group-hover:text-slate-100"
                                        : "text-foreground group-hover:text-primary"
                                }`}
                            >
                                {job.title}
                            </h3>

                            {/* Company Info - Compact */}
                            <p className="text-primary font-medium text-xs lg:text-sm mb-1 truncate">
                                {job.company?.name || "Unknown Company"}
                            </p>
                            <div className="flex items-center text-muted-foreground text-xs gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{job.location}</span>
                            </div>
                        </div>

                        {/* Save Button - Top Right */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSaveToggle}
                            className={`h-6 w-6 lg:h-7 lg:w-7 rounded-full transition-all duration-300 flex-shrink-0 ${
                                saved
                                    ? "text-red-500 hover:text-red-600"
                                    : "text-muted-foreground hover:text-red-500"
                            }`}
                        >
                            <Heart
                                className={`h-3 w-3 lg:h-4 lg:w-4 transition-all duration-300 ${
                                    saved ? "fill-current" : ""
                                }`}
                            />
                        </Button>
                    </div>

                    {/* Description - Compact */}
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-xs leading-relaxed flex-1">
                        {job.description}
                    </p>

                    {/* Badges - Compact */}
                    <div className="flex flex-wrap gap-1 mb-3">
                        {job.isRemote && (
                            <Badge
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                                원격
                            </Badge>
                        )}
                        {isFeatured && (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                                프리미엄
                            </Badge>
                        )}
                    </div>

                    {/* Skills - Limited for compact view */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                                {job.skills.slice(0, 2).map((skill, index) => (
                                    <Badge
                                        key={skill}
                                        variant="secondary"
                                        className="text-xs px-2 py-1"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                                {job.skills.length > 2 && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-1"
                                    >
                                        +{job.skills.length - 2}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom Footer - Compact for 4-column */}
                    <div className="mt-auto pt-3 border-t border-border/50">
                        <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                            <span className="flex items-center">
                                <User className="mr-1 h-3 w-3" />
                                {getExperienceLabel(job.experienceLevel || "")}
                            </span>
                            <span className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {getTimeAgo(job.createdAt)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                                {getJobTypeLabel(job.employmentType || "")}
                            </span>
                            <div className="text-right">
                                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                    {formatSalary(job.salaryMin, job.salaryMax)}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
