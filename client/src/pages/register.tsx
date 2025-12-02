/** @format */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    MapPin,
    Briefcase,
    UserCheck,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LOCATIONS } from "@/lib/types";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import MongolianIdInput from "@/components/auth/MongolianIdInput";
// import ImprovedMongolianIdInput from "@/components/auth/ImprovedMongolianIdInput"; // 파일 삭제됨
import CitizenshipSelector from "@/components/auth/CitizenshipSelector";
import EmailVerificationInput from "@/components/auth/EmailVerificationInput";
// import { parseMongolianId } from "@/data/mongolian-places"; // 파일 삭제됨
import { validatePassword } from "@/utils/validation";
import PhoneInput from "@/components/ui/phone-input";

export default function Register() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { t } = useLanguage();
    const [step, setStep] = useState<"accountType" | "form">("accountType");
    const [selectedAccountType, setSelectedAccountType] = useState<string>("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        location: "",
        userType: "",
        // Citizenship fields
        citizenshipType: "mongolian" as "mongolian" | "foreign",
        nationality: "",
        foreignId: "",
        // Mongolian specific fields
        ovog: "", // Family name
        ner: "", // Given name
        mongolianId: "", // Mongolian ID
        birthDate: "", // Birth date from mongolian ID
        birthPlace: "", // Birth place from mongolian ID
        // Phone contact fields
        phone: "",
        countryCode: "+976", // 기본값: 몽골
        // Employer specific fields
        companyRegistrationNumber: "",
        companyName: "",
        industry: "",
        companySize: "",
        position: "",
    });
    const [isMongolianIdValid, setIsMongolianIdValid] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        valid: false,
        errors: [] as string[],
        strength: "weak" as "weak" | "medium" | "strong",
    });

    const registerMutation = useMutation({
        mutationFn: async (data: Omit<typeof formData, "confirmPassword">) => {
            return await apiRequest("POST", "/api/auth/register", data);
        },
        onSuccess: (data: any) => {
            toast({
                title: t("register.success"),
                description: t("register.validation.successMessage"),
            });
            setLocation("/login");
        },
        onError: (error: any) => {
            toast({
                title: t("register.error"),
                description:
                    error.message || t("register.validation.errorMessage"),
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (
            !formData.email ||
            !formData.password ||
            !formData.phone ||
            !formData.ovog ||
            !formData.ner
        ) {
            toast({
                title: t("register.validation.inputError"),
                description: t("register.validation.allFieldsRequired"),
                variant: "destructive",
            });
            return;
        }

        // Employer specific validation
        if (selectedAccountType === "employer") {
            if (
                !formData.companyRegistrationNumber ||
                formData.companyRegistrationNumber.length !== 7
            ) {
                toast({
                    title: t("register.validation.inputError"),
                    description: t(
                        "register.validation.registrationNumberRequired"
                    ),
                    variant: "destructive",
                });
                return;
            }
            if (!formData.companyName) {
                toast({
                    title: t("register.validation.inputError"),
                    description: t("register.validation.companyNameRequired"),
                    variant: "destructive",
                });
                return;
            }
        }

        // Email verification validation
        if (!isEmailVerified) {
            toast({
                title: t("register.validation.inputError"),
                description: t("register.validation.emailVerificationRequired"),
                variant: "destructive",
            });
            return;
        }

        // Mongolian specific validation for candidates
        if (selectedAccountType === "candidate") {
            if (!formData.ovog || !formData.ner) {
                toast({
                    title: t("register.validation.inputError"),
                    description: t("register.validation.mongolianNameRequired"),
                    variant: "destructive",
                });
                return;
            }

            // Validate ID based on citizenship type
            if (formData.citizenshipType === "mongolian") {
                if (!formData.mongolianId || !isMongolianIdValid) {
                    toast({
                        title: t("register.validation.mongolianIdError"),
                        description: t(
                            "register.validation.mongolianIdInvalid"
                        ),
                        variant: "destructive",
                    });
                    return;
                }
            } else {
                // Foreign citizen validation
                if (!formData.nationality) {
                    toast({
                        title: t("register.validation.nationalityError"),
                        description: t(
                            "register.validation.nationalityRequired"
                        ),
                        variant: "destructive",
                    });
                    return;
                }
                if (
                    !formData.foreignId ||
                    formData.foreignId.trim().length < 3
                ) {
                    toast({
                        title: t("register.validation.foreignIdError"),
                        description: t("register.validation.foreignIdInvalid"),
                        variant: "destructive",
                    });
                    return;
                }
            }
        }

        // 비밀번호 유효성 검사
        const passwordCheck = validatePassword(formData.password);
        if (!passwordCheck.valid) {
            toast({
                title: t("register.validation.passwordError"),
                description: passwordCheck.errors.join(", "),
                variant: "destructive",
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: t("register.validation.passwordMismatch"),
                description: t("register.validation.passwordMismatchDesc"),
                variant: "destructive",
            });
            return;
        }

        // Prepare registration data
        const { confirmPassword, ...baseData } = formData;
        let registerData = {
            ...baseData,
            // 완전한 전화번호 조합
            fullPhone: `${formData.countryCode} ${formData.phone}`,
        };

        // Set fullName for both candidates and employers
        registerData.fullName = `${formData.ovog} ${formData.ner}`;

        // For candidates, handle ID based on citizenship type
        if (selectedAccountType === "candidate") {
            // 간단하게 몽골 ID만 저장 - 파싱 로직 제거
            if (
                formData.citizenshipType === "mongolian" &&
                formData.mongolianId
            ) {
                // 단순히 ID만 저장
                registerData.mongolianId = formData.mongolianId;
            }
        }

        registerMutation.mutate(registerData);
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // 비밀번호 실시간 유효성 검사
        if (field === "password") {
            const validation = validatePassword(value, t);
            setPasswordValidation(validation);
        }
    };

    const handleAccountTypeSelect = (accountType: string) => {
        setSelectedAccountType(accountType);
        setFormData((prev) => ({ ...prev, userType: accountType }));
        setStep("form");
    };

    const handleBackToAccountType = () => {
        setStep("accountType");
    };

    // Account Type Selection Step
    const renderAccountTypeSelection = () => (
        <div className="w-full max-w-2xl space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">
                    {t("register.accountType.title")}
                </h2>
                <p className="mt-2 text-muted-foreground">
                    {t("register.accountType.subtitle")}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Seeker Card */}
                <Card
                    className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
                    onClick={() => handleAccountTypeSelect("candidate")}
                >
                    <CardContent className="p-8 text-center">
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UserCheck className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3">
                            {t("register.accountType.jobSeeker.title")}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {t("register.accountType.jobSeeker.description")}
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-2 text-left">
                            <li>
                                •{" "}
                                {t(
                                    "register.accountType.jobSeeker.features.searchJobs"
                                )}
                            </li>
                            <li>
                                •{" "}
                                {t(
                                    "register.accountType.jobSeeker.features.createProfile"
                                )}
                            </li>
                            <li>
                                •{" "}
                                {t(
                                    "register.accountType.jobSeeker.features.applyJobs"
                                )}
                            </li>
                            <li>
                                •{" "}
                                {t(
                                    "register.accountType.jobSeeker.features.trackApplications"
                                )}
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Employer Card */}
                <Card
                    className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
                    onClick={() => handleAccountTypeSelect("employer")}
                >
                    <CardContent className="p-8 text-center">
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Briefcase className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3">
                            {t("register.accountType.employer.title")}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {t("register.accountType.employer.description")}
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-2 text-left">
                            <li>
                                •{" "}
                                {t(
                                    "register.accountType.employer.features.postJobs"
                                )}
                            </li>
                            <li>
                                •{" "}
                                {t(
                                    "register.accountType.employer.features.searchTalents"
                                )}
                            </li>
                            <li>
                                •{" "}
                                {t(
                                    "register.accountType.employer.features.manageApplications"
                                )}
                            </li>
                            <li>
                                •{" "}
                                {t(
                                    "register.accountType.employer.features.companyProfile"
                                )}
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    {t("register.accountType.alreadyHaveAccount")}{" "}
                    <Link
                        href="/login"
                        className="text-primary hover:underline font-medium"
                    >
                        {t("register.accountType.loginLink")}
                    </Link>
                </p>
            </div>
        </div>
    );

    // Registration Form Step
    const renderRegistrationForm = () => (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <Button
                    variant="ghost"
                    onClick={handleBackToAccountType}
                    className="mb-4 -ml-4 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("register.form.backToAccountType")}
                </Button>
                <h2 className="text-3xl font-bold text-foreground">
                    {t("register.form.title")}
                </h2>
                <p className="mt-2 text-muted-foreground">
                    {selectedAccountType === "candidate"
                        ? t("register.form.jobSeekerSubtitle")
                        : t("register.form.employerSubtitle")}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("register.form.cardTitle")}</CardTitle>
                    <CardDescription>
                        {/* {t('register.form.cardDescription')} */}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Citizenship Selection for Candidates */}
                        {selectedAccountType === "candidate" && (
                            <CitizenshipSelector
                                citizenshipType={formData.citizenshipType}
                                onCitizenshipChange={(type) =>
                                    handleInputChange("citizenshipType", type)
                                }
                                nationality={formData.nationality}
                                onNationalityChange={(nationality) =>
                                    handleInputChange(
                                        "nationality",
                                        nationality
                                    )
                                }
                                foreignId={formData.foreignId}
                                onForeignIdChange={(foreignId) =>
                                    handleInputChange("foreignId", foreignId)
                                }
                                disabled={registerMutation.isPending}
                            />
                        )}

                        {/* Name Fields */}
                        {selectedAccountType === "candidate" ? (
                            /* Mongolian/Foreign Name Fields for Candidates */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ovog">
                                        {formData.citizenshipType ===
                                        "mongolian"
                                            ? t("register.ovog")
                                            : t("register.form.lastName")}{" "}
                                        *
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="ovog"
                                            type="text"
                                            placeholder={
                                                formData.citizenshipType ===
                                                "mongolian"
                                                    ? t(
                                                          "register.ovogPlaceholder"
                                                      )
                                                    : t(
                                                          "register.form.lastNamePlaceholder"
                                                      )
                                            }
                                            value={formData.ovog}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "ovog",
                                                    e.target.value
                                                )
                                            }
                                            className="pl-10 h-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ner">
                                        {formData.citizenshipType ===
                                        "mongolian"
                                            ? t("register.ner")
                                            : t("register.form.firstName")}{" "}
                                        *
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="ner"
                                            type="text"
                                            placeholder={
                                                formData.citizenshipType ===
                                                "mongolian"
                                                    ? t(
                                                          "register.nerPlaceholder"
                                                      )
                                                    : t(
                                                          "register.form.firstNamePlaceholder"
                                                      )
                                            }
                                            value={formData.ner}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "ner",
                                                    e.target.value
                                                )
                                            }
                                            className="pl-10 h-10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Employer Name Fields - Same as Candidate */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ovog-employer">
                                        {t("register.ovog")} *
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="ovog-employer"
                                            type="text"
                                            placeholder={t(
                                                "register.ovogPlaceholder"
                                            )}
                                            value={formData.ovog}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "ovog",
                                                    e.target.value
                                                )
                                            }
                                            className="pl-10 h-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ner-employer">
                                        {t("register.ner")} *
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="ner-employer"
                                            type="text"
                                            placeholder={t(
                                                "register.nerPlaceholder"
                                            )}
                                            value={formData.ner}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "ner",
                                                    e.target.value
                                                )
                                            }
                                            className="pl-10 h-10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <EmailVerificationInput
                            value={formData.email}
                            onChange={(value) =>
                                handleInputChange("email", value)
                            }
                            onVerificationChange={setIsEmailVerified}
                            disabled={registerMutation.isPending}
                            required={true}
                        />

                        {/* ID Input for Candidates - Mongolian or Foreign */}
                        {selectedAccountType === "candidate" && (
                            <>
                                {formData.citizenshipType === "mongolian" ? (
                                    <MongolianIdInput
                                        value={formData.mongolianId}
                                        onChange={(value: string) =>
                                            handleInputChange(
                                                "mongolianId",
                                                value
                                            )
                                        }
                                        onValidChange={setIsMongolianIdValid}
                                        disabled={registerMutation.isPending}
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="foreignId">
                                            {t(
                                                "register.citizenship.foreignId"
                                            )}{" "}
                                            *
                                        </Label>
                                        <div className="relative">
                                            <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                id="foreignId"
                                                type="text"
                                                placeholder={t(
                                                    "register.citizenship.foreignIdPlaceholder"
                                                )}
                                                value={formData.foreignId}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "foreignId",
                                                        e.target.value
                                                    )
                                                }
                                                className="pl-10 h-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Account Type Specific Fields */}
                        {selectedAccountType === "candidate" ? (
                            <>
                                {/* Job Seeker - Contact Information */}
                                <PhoneInput
                                    value={formData.phone}
                                    onChange={(value) =>
                                        handleInputChange("phone", value)
                                    }
                                    countryCode={formData.countryCode}
                                    onCountryCodeChange={(code) =>
                                        handleInputChange("countryCode", code)
                                    }
                                    label={t("register.phone.label")}
                                    placeholder={t(
                                        "register.phone.placeholder"
                                    )}
                                    required={true}
                                    disabled={registerMutation.isPending}
                                />

                                {/* Job Seeker - Basic Information Only */}
                                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="h-4 w-4 text-blue-600" />
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                                            {t(
                                                "register.form.candidate.basicInfoTitle"
                                            )}
                                        </h4>
                                    </div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        {t(
                                            "register.form.candidate.basicInfoDesc"
                                        )}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Employer Specific Fields */}

                                {/* Company Registration Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="companyRegistrationNumber">
                                        {t(
                                            "register.form.employer.registrationNumber"
                                        )}{" "}
                                        *
                                    </Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="companyRegistrationNumber"
                                            type="text"
                                            placeholder={t(
                                                "register.form.employer.registrationNumberPlaceholder"
                                            )}
                                            value={
                                                formData.companyRegistrationNumber ||
                                                ""
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 7);
                                                handleInputChange(
                                                    "companyRegistrationNumber",
                                                    value
                                                );
                                            }}
                                            className="pl-10 h-10"
                                            maxLength={7}
                                            required
                                        />
                                    </div>
                                    {formData.companyRegistrationNumber &&
                                        formData.companyRegistrationNumber
                                            .length === 7 && (
                                            <div className="text-xs text-green-600 flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                <span>
                                                    {t(
                                                        "register.form.employer.registrationNumberValid"
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    {formData.companyRegistrationNumber &&
                                        formData.companyRegistrationNumber
                                            .length > 0 &&
                                        formData.companyRegistrationNumber
                                            .length < 7 && (
                                            <div className="text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                <span>
                                                    {t(
                                                        "register.form.employer.registrationNumberInvalid"
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                </div>

                                {/* Company Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">
                                        {t(
                                            "register.form.employer.companyName"
                                        )}{" "}
                                        *
                                    </Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="companyName"
                                            type="text"
                                            placeholder={t(
                                                "register.form.employer.companyNamePlaceholder"
                                            )}
                                            value={formData.companyName || ""}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "companyName",
                                                    e.target.value
                                                )
                                            }
                                            className="pl-10 h-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="industry">
                                            {t(
                                                "register.form.employer.industry"
                                            )}
                                        </Label>
                                        <Select
                                            value={formData.industry || ""}
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "industry",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue
                                                    placeholder={t(
                                                        "register.form.employer.industryPlaceholder"
                                                    )}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="technology">
                                                    {t(
                                                        "register.form.employer.industryOptions.technology"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="finance">
                                                    {t(
                                                        "register.form.employer.industryOptions.finance"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="healthcare">
                                                    {t(
                                                        "register.form.employer.industryOptions.healthcare"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="education">
                                                    {t(
                                                        "register.form.employer.industryOptions.education"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="retail">
                                                    {t(
                                                        "register.form.employer.industryOptions.retail"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="manufacturing">
                                                    {t(
                                                        "register.form.employer.industryOptions.manufacturing"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="construction">
                                                    {t(
                                                        "register.form.employer.industryOptions.construction"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="hospitality">
                                                    {t(
                                                        "register.form.employer.industryOptions.hospitality"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="transportation">
                                                    {t(
                                                        "register.form.employer.industryOptions.transportation"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="agriculture">
                                                    {t(
                                                        "register.form.employer.industryOptions.agriculture"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="media">
                                                    {t(
                                                        "register.form.employer.industryOptions.media"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="government">
                                                    {t(
                                                        "register.form.employer.industryOptions.government"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="nonprofit">
                                                    {t(
                                                        "register.form.employer.industryOptions.nonprofit"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="other">
                                                    {t(
                                                        "register.form.employer.industryOptions.other"
                                                    )}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="companySize">
                                            {t(
                                                "register.form.employer.companySize"
                                            )}
                                        </Label>
                                        <Select
                                            value={formData.companySize || ""}
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "companySize",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue
                                                    placeholder={t(
                                                        "register.form.employer.companySizePlaceholder"
                                                    )}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1-10">
                                                    {t(
                                                        "register.form.employer.companySizeOptions.startup"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="11-50">
                                                    {t(
                                                        "register.form.employer.companySizeOptions.small"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="51-200">
                                                    {t(
                                                        "register.form.employer.companySizeOptions.medium"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="201-1000">
                                                    {t(
                                                        "register.form.employer.companySizeOptions.large"
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="1000+">
                                                    {t(
                                                        "register.form.employer.companySizeOptions.enterprise"
                                                    )}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position">
                                        {t("register.form.employer.position")}
                                    </Label>
                                    <Input
                                        id="position"
                                        type="text"
                                        placeholder={t(
                                            "register.form.employer.positionPlaceholder"
                                        )}
                                        value={formData.position || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "position",
                                                e.target.value
                                            )
                                        }
                                        className="h-10"
                                    />
                                </div>

                                {/* Employer - Contact Information */}
                                <PhoneInput
                                    value={formData.phone}
                                    onChange={(value) =>
                                        handleInputChange("phone", value)
                                    }
                                    countryCode={formData.countryCode}
                                    onCountryCodeChange={(code) =>
                                        handleInputChange("countryCode", code)
                                    }
                                    label={t("register.form.employer.phone")}
                                    placeholder={t(
                                        "register.form.employer.phonePlaceholder"
                                    )}
                                    required={true}
                                    disabled={registerMutation.isPending}
                                />

                                {/* Employer Location */}
                                <div className="space-y-2">
                                    <Label htmlFor="location">
                                        {t("register.form.employer.location")}
                                    </Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Select
                                            value={formData.location}
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "location",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="pl-10 h-10">
                                                <SelectValue
                                                    placeholder={t(
                                                        "register.form.employer.locationPlaceholder"
                                                    )}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LOCATIONS.map((location) => (
                                                    <SelectItem
                                                        key={location}
                                                        value={location}
                                                    >
                                                        {location}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                {t("register.form.password")} *
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t(
                                        "register.form.passwordPlaceholder"
                                    )}
                                    value={formData.password}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "password",
                                            e.target.value
                                        )
                                    }
                                    className={`pl-10 pr-10 h-10 ${
                                        formData.password
                                            ? passwordValidation.valid
                                                ? "border-green-500 focus:border-green-500"
                                                : "border-red-500 focus:border-red-500"
                                            : ""
                                    }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {/* 비밀번호 강도 표시 */}
                            {formData.password && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-medium">
                                            {t(
                                                "register.password.strengthLabel"
                                            )}
                                            :
                                        </div>
                                        <div
                                            className={`text-xs px-2 py-1 rounded ${
                                                passwordValidation.strength ===
                                                "strong"
                                                    ? "bg-green-100 text-green-700"
                                                    : passwordValidation.strength ===
                                                      "medium"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {passwordValidation.strength ===
                                            "strong"
                                                ? t(
                                                      "register.password.strength.strong"
                                                  )
                                                : passwordValidation.strength ===
                                                  "medium"
                                                ? t(
                                                      "register.password.strength.medium"
                                                  )
                                                : t(
                                                      "register.password.strength.weak"
                                                  )}
                                        </div>
                                    </div>

                                    {/* 에러 메시지 표시 */}
                                    {passwordValidation.errors.length > 0 && (
                                        <div className="space-y-1">
                                            {passwordValidation.errors.map(
                                                (error, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-1 text-xs text-red-600"
                                                    >
                                                        <AlertCircle className="h-3 w-3" />
                                                        <span>{error}</span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {/* 성공 메시지 */}
                                    {passwordValidation.valid && (
                                        <div className="flex items-center gap-1 text-xs text-green-600">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>
                                                {t("register.password.valid")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                {t("register.form.confirmPassword")} *
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder={t(
                                        "register.form.confirmPasswordPlaceholder"
                                    )}
                                    value={formData.confirmPassword}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "confirmPassword",
                                            e.target.value
                                        )
                                    }
                                    className="pl-10 pr-10 h-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="w-full"
                        >
                            {registerMutation.isPending
                                ? t("register.form.submitting")
                                : t("register.form.submit")}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            {t("register.form.alreadyHaveAccount")}{" "}
                            <Link
                                href="/login"
                                className="text-primary hover:underline font-medium"
                            >
                                {t("register.form.loginLink")}
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
                {step === "accountType"
                    ? renderAccountTypeSelection()
                    : renderRegistrationForm()}
            </main>

            <Footer />
        </div>
    );
}
