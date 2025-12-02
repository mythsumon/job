import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Upload, X, Calendar, MapPin, Phone, Mail, Globe, Linkedin, Github, User, Award, Star, Camera, GraduationCap, Briefcase, Code, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { processProfilePicture, isValidImageFile } from "@/utils/imageUtils";

// Enhanced Resume Schema
const resumeSchema = z.object({
  title: z.string().min(1, "이력서 제목을 입력해주세요"),
  summary: z.string().optional(),
  
  // Basic Information
  basicInfo: z.object({
    fullName: z.string().min(1, "이름을 입력해주세요"),
    email: z.string().email("올바른 이메일을 입력해주세요"),
    phone: z.string().min(1, "전화번호를 입력해주세요"),
    address: z.string().min(1, "주소를 입력해주세요"),
    city: z.string().min(1, "도시를 입력해주세요"),
    country: z.string().min(1, "국가를 입력해주세요"),
    postalCode: z.string().optional(),
    dateOfBirth: z.string().optional(),
    nationality: z.string().min(1, "국적을 입력해주세요"),
    maritalStatus: z.string().optional(),
    drivingLicense: z.boolean().default(false),
    availability: z.string().min(1, "근무 가능 시기를 입력해주세요"),
    expectedSalary: z.string().optional(),
    website: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
    github: z.string().url().optional().or(z.literal("")),
    portfolio: z.string().url().optional().or(z.literal("")),
    profilePicture: z.string().optional(),
  }),
  
  // Skills and Languages
  skillsAndLanguages: z.object({
    technicalSkills: z.array(z.object({
      category: z.string().min(1, "기술 분야를 입력해주세요"),
      skills: z.array(z.object({
        name: z.string().min(1, "기술명을 입력해주세요"),
        level: z.string().min(1, "수준을 선택해주세요"),
      })),
    })),
    softSkills: z.array(z.string()),
    languages: z.array(z.object({
      name: z.string().min(1, "언어명을 입력해주세요"),
      proficiency: z.string().min(1, "숙련도를 선택해주세요"),
      certification: z.string().optional(),
    })),
    certifications: z.array(z.object({
      name: z.string().min(1, "자격증명을 입력해주세요"),
      issuer: z.string().min(1, "발급기관을 입력해주세요"),
      date: z.string().min(1, "취득일을 입력해주세요"),
      expiryDate: z.string().optional(),
      credentialId: z.string().optional(),
    })),
  }),
  
  // Portfolio
  portfolio: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "제목을 입력해주세요"),
    description: z.string().min(1, "설명을 입력해주세요"),
    images: z.array(z.string()),
    category: z.string().min(1, "카테고리를 선택해주세요"),
    tags: z.array(z.string()),
    url: z.string().url().optional().or(z.literal("")),
    completionDate: z.string().min(1, "완성일을 입력해주세요"),
    client: z.string().optional(),
    role: z.string().min(1, "역할을 입력해주세요"),
  })),
  
  // Education (keeping existing structure)
  education: z.array(z.object({
    institution: z.string().min(1, "교육기관을 입력해주세요"),
    degree: z.string().min(1, "학위를 입력해주세요"),
    field: z.string().min(1, "전공을 입력해주세요"),
    startDate: z.string().min(1, "시작일을 입력해주세요"),
    endDate: z.string().optional(),
    current: z.boolean().default(false),
    gpa: z.string().optional(),
    description: z.string().optional(),
    achievements: z.array(z.string()).optional(),
  })),
  
  // Work History (keeping existing structure)
  workHistory: z.array(z.object({
    company: z.string().min(1, "회사명을 입력해주세요"),
    position: z.string().min(1, "직책을 입력해주세요"),
    startDate: z.string().min(1, "시작일을 입력해주세요"),
    endDate: z.string().optional(),
    current: z.boolean().default(false),
    description: z.string().min(1, "업무 설명을 입력해주세요"),
    achievements: z.array(z.string()),
  })),
  
  // Additional Information
  additionalInfo: z.object({
    hobbies: z.array(z.string()),
    volunteerWork: z.array(z.object({
      organization: z.string().min(1, "단체명을 입력해주세요"),
      role: z.string().min(1, "역할을 입력해주세요"),
      startDate: z.string().min(1, "시작일을 입력해주세요"),
      endDate: z.string().optional(),
      current: z.boolean().default(false),
      description: z.string().min(1, "활동 설명을 입력해주세요"),
    })),
    awards: z.array(z.object({
      title: z.string().min(1, "수상명을 입력해주세요"),
      issuer: z.string().min(1, "수여기관을 입력해주세요"),
      date: z.string().min(1, "수상일을 입력해주세요"),
      description: z.string().optional(),
    })),
    references: z.array(z.object({
      name: z.string().min(1, "이름을 입력해주세요"),
      position: z.string().min(1, "직책을 입력해주세요"),
      company: z.string().min(1, "회사명을 입력해주세요"),
      email: z.string().email("올바른 이메일을 입력해주세요"),
      phone: z.string().min(1, "전화번호를 입력해주세요"),
      relationship: z.string().min(1, "관계를 입력해주세요"),
    })),
    additionalSkills: z.array(z.string()),
    personalStatement: z.string().optional(),
    careerObjective: z.string().optional(),
  }),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

interface EnhancedResumeFormProps {
  onSubmit: (data: ResumeFormData) => void;
  initialData?: Partial<ResumeFormData>;
  isLoading?: boolean;
}

export function EnhancedResumeForm({ onSubmit, initialData, isLoading }: EnhancedResumeFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const profilePictureRef = useRef<HTMLInputElement>(null);

  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      title: initialData?.title || "",
      summary: initialData?.summary || "",
      basicInfo: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "몽골",
        nationality: "몽골",
        maritalStatus: "미혼",
        drivingLicense: false,
        availability: "즉시 가능",
        ...initialData?.basicInfo,
      },
      skillsAndLanguages: {
        technicalSkills: [],
        softSkills: [],
        languages: [],
        certifications: [],
        ...initialData?.skillsAndLanguages,
      },
      portfolio: initialData?.portfolio || [],
      education: initialData?.education || [],
      workHistory: initialData?.workHistory || [],
      additionalInfo: {
        hobbies: [],
        volunteerWork: [],
        awards: [],
        references: [],
        additionalSkills: [],
        personalStatement: "",
        careerObjective: "",
        ...initialData?.additionalInfo,
      },
    },
  });

  // Field arrays for dynamic sections
  const { fields: techSkillFields, append: appendTechSkill, remove: removeTechSkill } = useFieldArray({
    control: form.control,
    name: "skillsAndLanguages.technicalSkills",
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control: form.control,
    name: "skillsAndLanguages.languages",
  });

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: "skillsAndLanguages.certifications",
  });

  const { fields: portfolioFields, append: appendPortfolio, remove: removePortfolio } = useFieldArray({
    control: form.control,
    name: "portfolio",
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control: form.control,
    name: "workHistory",
  });

  const { fields: volunteerFields, append: appendVolunteer, remove: removeVolunteer } = useFieldArray({
    control: form.control,
    name: "additionalInfo.volunteerWork",
  });

  const { fields: awardFields, append: appendAward, remove: removeAward } = useFieldArray({
    control: form.control,
    name: "additionalInfo.awards",
  });

  const { fields: referenceFields, append: appendReference, remove: removeReference } = useFieldArray({
    control: form.control,
    name: "additionalInfo.references",
  });

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isValidImageFile(file)) {
      toast({
        title: "오류",
        description: "지원하지 않는 파일 형식입니다. JPG, PNG, WEBP 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const processedImage = await processProfilePicture(file);
      form.setValue("basicInfo.profilePicture", processedImage.dataUrl);
      toast({
        title: "성공",
        description: "프로필 사진이 업로드되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "이미지 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handlePortfolioImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, portfolioIndex: number) => {
    const files = event.target.files;
    if (!files) return;

    const currentPortfolio = form.getValues(`portfolio.${portfolioIndex}`);
    const newImages = [...(currentPortfolio.images || [])];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!isValidImageFile(file)) continue;

      try {
        const processedImage = await processProfilePicture(file);
        newImages.push(processedImage.dataUrl);
      } catch (error) {
        console.error("Image processing error:", error);
      }
    }

    form.setValue(`portfolio.${portfolioIndex}.images`, newImages);
    toast({
      title: "성공",
      description: `${newImages.length - (currentPortfolio.images?.length || 0)}개의 이미지가 추가되었습니다.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이력서 제목 *</FormLabel>
                <FormControl>
                  <Input placeholder="예: 김철수의 이력서" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>자기소개</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="간단한 자기소개를 작성해주세요"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">기본정보</TabsTrigger>
            <TabsTrigger value="education">학력</TabsTrigger>
            <TabsTrigger value="experience">경력</TabsTrigger>
            <TabsTrigger value="skills">기술/언어</TabsTrigger>
            <TabsTrigger value="portfolio">포트폴리오</TabsTrigger>
            <TabsTrigger value="additional">기타</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="space-y-4">
                  <FormLabel>프로필 사진</FormLabel>
                  <div className="flex items-center gap-4">
                    {form.watch("basicInfo.profilePicture") && (
                      <div className="relative">
                        <img
                          src={form.watch("basicInfo.profilePicture")}
                          alt="프로필 사진"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => form.setValue("basicInfo.profilePicture", "")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => profilePictureRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      사진 업로드
                    </Button>
                    <input
                      type="file"
                      ref={profilePictureRef}
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="basicInfo.fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이름 *</FormLabel>
                        <FormControl>
                          <Input placeholder="김철수" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basicInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이메일 *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basicInfo.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>전화번호 *</FormLabel>
                        <FormControl>
                          <Input placeholder="+976-88001234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basicInfo.dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>생년월일</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basicInfo.nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>국적 *</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="국적을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="몽골">몽골</SelectItem>
                              <SelectItem value="한국">한국</SelectItem>
                              <SelectItem value="중국">중국</SelectItem>
                              <SelectItem value="러시아">러시아</SelectItem>
                              <SelectItem value="기타">기타</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basicInfo.maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>결혼 여부</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="결혼 여부를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="미혼">미혼</SelectItem>
                              <SelectItem value="기혼">기혼</SelectItem>
                              <SelectItem value="기타">기타</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">주소 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="basicInfo.address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>주소 *</FormLabel>
                          <FormControl>
                            <Input placeholder="상세 주소를 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="basicInfo.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>도시 *</FormLabel>
                          <FormControl>
                            <Input placeholder="울란바타르" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="basicInfo.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>국가 *</FormLabel>
                          <FormControl>
                            <Input placeholder="몽골" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="basicInfo.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>우편번호</FormLabel>
                          <FormControl>
                            <Input placeholder="14200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Career Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">경력 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="basicInfo.availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>근무 가능 시기 *</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="근무 가능 시기를 선택하세요" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="즉시 가능">즉시 가능</SelectItem>
                                <SelectItem value="1주일 후">1주일 후</SelectItem>
                                <SelectItem value="2주일 후">2주일 후</SelectItem>
                                <SelectItem value="1개월 후">1개월 후</SelectItem>
                                <SelectItem value="2개월 후">2개월 후</SelectItem>
                                <SelectItem value="3개월 후">3개월 후</SelectItem>
                                <SelectItem value="협의 가능">협의 가능</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="basicInfo.expectedSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>희망 연봉</FormLabel>
                          <FormControl>
                            <Input placeholder="예: 3000만 투그릭" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="basicInfo.drivingLicense"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>운전면허 보유</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Online Presence */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">온라인 프로필</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="basicInfo.website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            웹사이트
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourwebsite.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="basicInfo.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="basicInfo.github"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Github className="h-4 w-4" />
                            GitHub
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/yourusername" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="basicInfo.portfolio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>포트폴리오 웹사이트</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourportfolio.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    학력
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendEducation({
                      institution: "",
                      degree: "",
                      field: "",
                      startDate: "",
                      endDate: "",
                      current: false,
                      gpa: "",
                      description: "",
                      achievements: [],
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    학력 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {educationFields.map((field, index) => (
                  <Card key={field.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">학력 {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.institution`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>교육기관 *</FormLabel>
                              <FormControl>
                                <Input placeholder="몽골국립대학교" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.degree`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>학위 *</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="학위를 선택하세요" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="고등학교 졸업">고등학교 졸업</SelectItem>
                                    <SelectItem value="전문학사">전문학사</SelectItem>
                                    <SelectItem value="학사">학사</SelectItem>
                                    <SelectItem value="석사">석사</SelectItem>
                                    <SelectItem value="박사">박사</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.field`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>전공 *</FormLabel>
                              <FormControl>
                                <Input placeholder="컴퓨터공학" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.gpa`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>학점</FormLabel>
                              <FormControl>
                                <Input placeholder="3.8/4.0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>시작일 *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>종료일</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  disabled={form.watch(`education.${index}.current`)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.current`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>현재 재학 중</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`education.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>설명</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="관련 수업, 프로젝트, 활동 등을 설명해주세요"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                {educationFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    학력 정보를 추가해주세요
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Experience Tab */}
          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    경력
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendWork({
                      company: "",
                      position: "",
                      startDate: "",
                      endDate: "",
                      current: false,
                      description: "",
                      achievements: [],
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    경력 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {workFields.map((field, index) => (
                  <Card key={field.id} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">경력 {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWork(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`workHistory.${index}.company`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>회사명 *</FormLabel>
                              <FormControl>
                                <Input placeholder="ABC 회사" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`workHistory.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>직책 *</FormLabel>
                              <FormControl>
                                <Input placeholder="소프트웨어 개발자" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`workHistory.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>시작일 *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`workHistory.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>종료일</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  disabled={form.watch(`workHistory.${index}.current`)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name={`workHistory.${index}.current`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>현재 근무 중</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`workHistory.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>업무 설명 *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="주요 업무 내용과 책임을 설명해주세요"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                {workFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    경력 정보를 추가해주세요
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills and Languages Tab */}
          <TabsContent value="skills" className="space-y-6">
            {/* Technical Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>전문 기술</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendTechSkill({
                      category: "",
                      skills: [{ name: "", level: "" }],
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    기술 분야 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {techSkillFields.map((field, categoryIndex) => (
                  <Card key={field.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <FormField
                          control={form.control}
                          name={`skillsAndLanguages.technicalSkills.${categoryIndex}.category`}
                          render={({ field }) => (
                            <FormItem className="flex-1 mr-4">
                              <FormLabel>기술 분야 *</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="기술 분야를 선택하세요" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="언어">언어 (Language)</SelectItem>
                                    <SelectItem value="회계">회계 (Accounting)</SelectItem>
                                    <SelectItem value="마케팅">마케팅 (Marketing)</SelectItem>
                                    <SelectItem value="디자인">디자인 (Design)</SelectItem>
                                    <SelectItem value="기계">기계 (Mechanical)</SelectItem>
                                    <SelectItem value="전기">전기 (Electrical)</SelectItem>
                                    <SelectItem value="건설">건설 (Construction)</SelectItem>
                                    <SelectItem value="의료">의료 (Medical)</SelectItem>
                                    <SelectItem value="교육">교육 (Education)</SelectItem>
                                    <SelectItem value="요리">요리 (Cooking)</SelectItem>
                                    <SelectItem value="운전">운전 (Driving)</SelectItem>
                                    <SelectItem value="사무">사무 (Office)</SelectItem>
                                    <SelectItem value="영업">영업 (Sales)</SelectItem>
                                    <SelectItem value="고객서비스">고객서비스 (Customer Service)</SelectItem>
                                    <SelectItem value="IT">IT (Information Technology)</SelectItem>
                                    <SelectItem value="기타">기타 (Other)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTechSkill(categoryIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {form.watch(`skillsAndLanguages.technicalSkills.${categoryIndex}.skills`)?.map((_, skillIndex) => (
                          <div key={skillIndex} className="flex gap-3 items-end">
                            <FormField
                              control={form.control}
                              name={`skillsAndLanguages.technicalSkills.${categoryIndex}.skills.${skillIndex}.name`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>기술명 *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="예: Microsoft Excel, 용접, 영어회화" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`skillsAndLanguages.technicalSkills.${categoryIndex}.skills.${skillIndex}.level`}
                              render={({ field }) => (
                                <FormItem className="w-32">
                                  <FormLabel>수준 *</FormLabel>
                                  <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="수준" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="초급">초급</SelectItem>
                                        <SelectItem value="중급">중급</SelectItem>
                                        <SelectItem value="고급">고급</SelectItem>
                                        <SelectItem value="전문가">전문가</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentSkills = form.getValues(`skillsAndLanguages.technicalSkills.${categoryIndex}.skills`);
                                const newSkills = currentSkills.filter((_, index) => index !== skillIndex);
                                form.setValue(`skillsAndLanguages.technicalSkills.${categoryIndex}.skills`, newSkills);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentSkills = form.getValues(`skillsAndLanguages.technicalSkills.${categoryIndex}.skills`) || [];
                            form.setValue(`skillsAndLanguages.technicalSkills.${categoryIndex}.skills`, [
                              ...currentSkills,
                              { name: "", level: "" }
                            ]);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          기술 추가
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {techSkillFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    전문 기술 정보를 추가해주세요
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>언어 능력</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendLanguage({
                      name: "",
                      proficiency: "",
                      certification: "",
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    언어 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {languageFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-end">
                    <FormField
                      control={form.control}
                      name={`skillsAndLanguages.languages.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>언어 *</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="언어를 선택하세요" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="몽골어">몽골어</SelectItem>
                                <SelectItem value="한국어">한국어</SelectItem>
                                <SelectItem value="영어">영어</SelectItem>
                                <SelectItem value="중국어">중국어</SelectItem>
                                <SelectItem value="러시아어">러시아어</SelectItem>
                                <SelectItem value="일본어">일본어</SelectItem>
                                <SelectItem value="독일어">독일어</SelectItem>
                                <SelectItem value="프랑스어">프랑스어</SelectItem>
                                <SelectItem value="기타">기타</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`skillsAndLanguages.languages.${index}.proficiency`}
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <FormLabel>숙련도 *</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="숙련도" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="모국어">모국어</SelectItem>
                                <SelectItem value="유창함">유창함</SelectItem>
                                <SelectItem value="대화가능">대화가능</SelectItem>
                                <SelectItem value="기초">기초</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`skillsAndLanguages.languages.${index}.certification`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>자격증/인증</FormLabel>
                          <FormControl>
                            <Input placeholder="예: TOPIK 6급, IELTS 7.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {languageFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    언어 능력 정보를 추가해주세요
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    자격증/인증
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendCertification({
                      name: "",
                      issuer: "",
                      date: "",
                      expiryDate: "",
                      credentialId: "",
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    자격증 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {certificationFields.map((field, index) => (
                  <Card key={field.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">자격증 {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCertification(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`skillsAndLanguages.certifications.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>자격증명 *</FormLabel>
                              <FormControl>
                                <Input placeholder="예: 정보처리기사, 회계사, 용접기능사" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skillsAndLanguages.certifications.${index}.issuer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>발급기관 *</FormLabel>
                              <FormControl>
                                <Input placeholder="예: 한국산업인력공단" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skillsAndLanguages.certifications.${index}.date`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>취득일 *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skillsAndLanguages.certifications.${index}.expiryDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>만료일</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skillsAndLanguages.certifications.${index}.credentialId`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>인증 ID</FormLabel>
                              <FormControl>
                                <Input placeholder="자격증 번호 또는 인증 ID" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {certificationFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    자격증/인증 정보를 추가해주세요
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>포트폴리오</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendPortfolio({
                      id: Date.now().toString(),
                      title: "",
                      description: "",
                      images: [],
                      category: "",
                      tags: [],
                      url: "",
                      completionDate: "",
                      client: "",
                      role: "",
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    포트폴리오 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {portfolioFields.map((field, index) => (
                  <Card key={field.id} className="border-l-4 border-l-pink-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">포트폴리오 {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePortfolio(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`portfolio.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>제목 *</FormLabel>
                              <FormControl>
                                <Input placeholder="포트폴리오 제목" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`portfolio.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>카테고리 *</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="카테고리를 선택하세요" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="디자인">디자인</SelectItem>
                                    <SelectItem value="요리">요리</SelectItem>
                                    <SelectItem value="건축">건축</SelectItem>
                                    <SelectItem value="패션">패션</SelectItem>
                                    <SelectItem value="사진">사진</SelectItem>
                                    <SelectItem value="예술">예술</SelectItem>
                                    <SelectItem value="공예">공예</SelectItem>
                                    <SelectItem value="인테리어">인테리어</SelectItem>
                                    <SelectItem value="마케팅">마케팅</SelectItem>
                                    <SelectItem value="교육">교육</SelectItem>
                                    <SelectItem value="기타">기타</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`portfolio.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>역할 *</FormLabel>
                              <FormControl>
                                <Input placeholder="예: 디자이너, 요리사, 기획자" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`portfolio.${index}.completionDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>완성일 *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`portfolio.${index}.client`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>클라이언트/고객</FormLabel>
                              <FormControl>
                                <Input placeholder="프로젝트 의뢰처" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`portfolio.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>웹사이트 URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`portfolio.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>설명 *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="포트폴리오에 대한 상세한 설명을 작성해주세요"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Image Upload */}
                      <div className="space-y-4">
                        <FormLabel>이미지</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {form.watch(`portfolio.${index}.images`)?.map((image, imageIndex) => (
                            <div key={imageIndex} className="relative">
                              <img
                                src={image}
                                alt={`포트폴리오 이미지 ${imageIndex + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={() => {
                                  const currentImages = form.getValues(`portfolio.${index}.images`);
                                  const newImages = currentImages.filter((_, idx) => idx !== imageIndex);
                                  form.setValue(`portfolio.${index}.images`, newImages);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <Upload className="h-6 w-6 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">이미지 추가</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handlePortfolioImageUpload(e, index)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        <FormLabel>태그</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {form.watch(`portfolio.${index}.tags`)?.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => {
                                  const currentTags = form.getValues(`portfolio.${index}.tags`);
                                  const newTags = currentTags.filter((_, idx) => idx !== tagIndex);
                                  form.setValue(`portfolio.${index}.tags`, newTags);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="태그를 입력하고 Enter를 누르세요"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                const tag = input.value.trim();
                                if (tag) {
                                  const currentTags = form.getValues(`portfolio.${index}.tags`) || [];
                                  if (!currentTags.includes(tag)) {
                                    form.setValue(`portfolio.${index}.tags`, [...currentTags, tag]);
                                  }
                                  input.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {portfolioFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    포트폴리오 정보를 추가해주세요
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional Information Tab */}
          <TabsContent value="additional" className="space-y-6">
            {/* Career Objective */}
            <Card>
              <CardHeader>
                <CardTitle>경력 목표</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="additionalInfo.careerObjective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>경력 목표</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="향후 경력 계획과 목표를 작성해주세요"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Personal Statement */}
            <Card>
              <CardHeader>
                <CardTitle>개인 성명서</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="additionalInfo.personalStatement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>개인 성명서</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="자신의 철학, 가치관, 장점 등을 자유롭게 작성해주세요"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Hobbies */}
            <Card>
              <CardHeader>
                <CardTitle>취미/관심사</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {form.watch("additionalInfo.hobbies")?.map((hobby, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {hobby}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => {
                            const currentHobbies = form.getValues("additionalInfo.hobbies");
                            const newHobbies = currentHobbies.filter((_, idx) => idx !== index);
                            form.setValue("additionalInfo.hobbies", newHobbies);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="취미를 입력하고 Enter를 누르세요"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const hobby = input.value.trim();
                        if (hobby) {
                          const currentHobbies = form.getValues("additionalInfo.hobbies") || [];
                          if (!currentHobbies.includes(hobby)) {
                            form.setValue("additionalInfo.hobbies", [...currentHobbies, hobby]);
                          }
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Volunteer Work */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>봉사활동</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendVolunteer({
                      organization: "",
                      role: "",
                      startDate: "",
                      endDate: "",
                      current: false,
                      description: "",
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    봉사활동 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {volunteerFields.map((field, index) => (
                  <Card key={field.id} className="border-l-4 border-l-green-400">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">봉사활동 {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVolunteer(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`additionalInfo.volunteerWork.${index}.organization`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>단체명 *</FormLabel>
                              <FormControl>
                                <Input placeholder="봉사 단체명" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`additionalInfo.volunteerWork.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>역할 *</FormLabel>
                              <FormControl>
                                <Input placeholder="봉사자 역할" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`additionalInfo.volunteerWork.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>시작일 *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`additionalInfo.volunteerWork.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>종료일</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  disabled={form.watch(`additionalInfo.volunteerWork.${index}.current`)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name={`additionalInfo.volunteerWork.${index}.current`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>현재 진행 중</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`additionalInfo.volunteerWork.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>활동 설명 *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="봉사활동 내용을 설명해주세요"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                {volunteerFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    봉사활동 정보를 추가해주세요
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Awards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    수상 경력
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAward({
                      title: "",
                      issuer: "",
                      date: "",
                      description: "",
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    수상 경력 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {awardFields.map((field, index) => (
                  <Card key={field.id} className="border-l-4 border-l-yellow-400">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">수상 {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAward(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`additionalInfo.awards.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>수상명 *</FormLabel>
                              <FormControl>
                                <Input placeholder="수상 제목" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`additionalInfo.awards.${index}.issuer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>수여기관 *</FormLabel>
                              <FormControl>
                                <Input placeholder="수여기관명" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`additionalInfo.awards.${index}.date`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>수상일 *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`additionalInfo.awards.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>설명</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="수상 사유 및 상세 내용"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                {awardFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    수상 경력 정보를 추가해주세요
                  </div>
                )}
              </CardContent>
            </Card>

            {/* References */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>추천인</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendReference({
                      name: "",
                      position: "",
                      company: "",
                      email: "",
                      phone: "",
                      relationship: "",
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    추천인 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {referenceFields.map((field, index) => (
                  <Card key={field.id} className="border-l-4 border-l-blue-400">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">추천인 {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReference(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`additionalInfo.references.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>이름 *</FormLabel>
                              <FormControl>
                                <Input placeholder="추천인 이름" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`additionalInfo.references.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>직책 *</FormLabel>
                              <FormControl>
                                <Input placeholder="추천인 직책" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`additionalInfo.references.${index}.company`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>회사명 *</FormLabel>
                              <FormControl>
                                <Input placeholder="추천인 소속 회사" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`additionalInfo.references.${index}.relationship`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>관계 *</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="관계를 선택하세요" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="전 상사">전 상사</SelectItem>
                                    <SelectItem value="동료">동료</SelectItem>
                                    <SelectItem value="교수">교수</SelectItem>
                                    <SelectItem value="멘토">멘토</SelectItem>
                                    <SelectItem value="클라이언트">클라이언트</SelectItem>
                                    <SelectItem value="기타">기타</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`additionalInfo.references.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>이메일 *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="추천인 이메일" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`additionalInfo.references.${index}.phone`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>전화번호 *</FormLabel>
                              <FormControl>
                                <Input placeholder="추천인 전화번호" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {referenceFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    추천인 정보를 추가해주세요
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            초기화
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? "저장 중..." : "이력서 생성"}
          </Button>
        </div>
      </form>
    </Form>
  );
}