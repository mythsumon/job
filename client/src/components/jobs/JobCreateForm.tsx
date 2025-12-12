import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/queryClient";
import { SkillsMultiSelect } from "./SkillsMultiSelect";
import { BenefitsInput } from "./BenefitsInput";

interface JobCreateFormProps {
  onSubmit?: (data: any) => void;
  onSaveDraft?: (data: any) => void;
  isLoading?: boolean;
  initialData?: any;
  mode?: "create" | "edit";
  onCancel?: () => void;
}

export function JobCreateForm({
  onSubmit,
  onSaveDraft,
  isLoading = false,
  initialData,
  mode = "create",
  onCancel,
}: JobCreateFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  // Fetch job options from API
  const { data: departments = [] } = useQuery({
    queryKey: ["/api/admin/job-options/departments"],
    queryFn: async () => {
      try {
        return await apiGet("/api/admin/job-options/departments");
      } catch {
        // Fallback to default options
        return [
          { id: 1, name: "개발팀", nameKo: "개발팀", nameEn: "Development", nameMn: "Хөгжүүлэлт" },
          { id: 2, name: "디자인팀", nameKo: "디자인팀", nameEn: "Design", nameMn: "Дизайн" },
          { id: 3, name: "마케팅팀", nameKo: "마케팅팀", nameEn: "Marketing", nameMn: "Маркетинг" },
          { id: 4, name: "데이터팀", nameKo: "데이터팀", nameEn: "Data", nameMn: "Өгөгдөл" },
        ];
      }
    },
  });

  const { data: employmentTypes = [] } = useQuery({
    queryKey: ["/api/admin/job-options/employment-types"],
    queryFn: async () => {
      try {
        return await apiGet("/api/admin/job-options/employment-types");
      } catch {
        return [
          { id: 1, name: "정규직", nameKo: "정규직", nameEn: "Full Time", nameMn: "Бүтэн цагийн" },
          { id: 2, name: "계약직", nameKo: "계약직", nameEn: "Contract", nameMn: "Гэрээт" },
          { id: 3, name: "파트타임", nameKo: "파트타임", nameEn: "Part Time", nameMn: "Хагас цагийн" },
          { id: 4, name: "인턴", nameKo: "인턴", nameEn: "Intern", nameMn: "Дадлагажигч" },
        ];
      }
    },
  });

  const { data: experienceLevels = [] } = useQuery({
    queryKey: ["/api/admin/job-options/experience-levels"],
    queryFn: async () => {
      try {
        return await apiGet("/api/admin/job-options/experience-levels");
      } catch {
        return [
          { id: 1, name: "신입 (0-2년)", nameKo: "신입 (0-2년)", nameEn: "Entry (0-2 years)", nameMn: "Эхлэгч (0-2 жил)" },
          { id: 2, name: "주니어 (3-5년)", nameKo: "주니어 (3-5년)", nameEn: "Junior (3-5 years)", nameMn: "Дунд (3-5 жил)" },
          { id: 3, name: "미드 (3-7년)", nameKo: "미드 (3-7년)", nameEn: "Mid (3-7 years)", nameMn: "Дунд (3-7 жил)" },
          { id: 4, name: "시니어 (6-10년)", nameKo: "시니어 (6-10년)", nameEn: "Senior (6-10 years)", nameMn: "Ахлах (6-10 жил)" },
          { id: 5, name: "전문가 (10년+)", nameKo: "전문가 (10년+)", nameEn: "Expert (10+ years)", nameMn: "Мэргэжилтэн (10+ жил)" },
        ];
      }
    },
  });

  const { language } = useLanguage();
  
  const getDisplayName = (option: any) => {
    if (language === "ko" && option.nameKo) return option.nameKo;
    if (language === "en" && option.nameEn) return option.nameEn;
    if (language === "mn" && option.nameMn) return option.nameMn;
    return option.name;
  };
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "", // Domain: title (not jobTitle)
    // TODO: department field removed - not in domain spec
    employmentType: initialData?.employmentType || "",
    experienceLevel: initialData?.experienceLevel || "", // Domain: experienceLevel (not experience)
    location: initialData?.location || "",
    salary: initialData?.salary || "", // Domain: salary (not salaryRange) - string format like "2000-3000만원"
    deadline: initialData?.deadline || "",
    description: initialData?.description || "", // Domain: description (not jobDescription)
    requiredSkills: initialData?.requiredSkills || [], // Domain: requiredSkills (not skills)
    requirements: initialData?.requirements || "", // Requirements/Eligibility field
    benefits: initialData?.benefits || [], // Benefits field - array of strings
    // TODO: preferred field removed - not in domain spec
    // TODO: isRemote field removed - not in domain spec
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        title: t("common.error") || "오류",
        description: "제목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Map to domain Job type
    const jobData = {
      title: formData.title,
      employmentType: formData.employmentType,
      experienceLevel: formData.experienceLevel,
      location: formData.location,
      salary: formData.salary,
      deadline: formData.deadline,
      description: formData.description,
      requiredSkills: formData.requiredSkills || [],
      requirements: formData.requirements || "",
      benefits: formData.benefits || [],
    };

    onSubmit?.(jobData);
  };

  const handleSaveDraft = () => {
    // Map to domain Job type
    const jobData = {
      title: formData.title,
      employmentType: formData.employmentType,
      experienceLevel: formData.experienceLevel,
      location: formData.location,
      salary: formData.salary,
      deadline: formData.deadline,
      description: formData.description,
      requiredSkills: formData.requiredSkills || [],
      requirements: formData.requirements || "",
      benefits: formData.benefits || [],
    };
    onSaveDraft?.(jobData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>제목 (Title)</Label>
        <Input
          placeholder="예: Senior Frontend Developer"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          required
        />
      </div>
      {/* TODO: department field removed - not in domain spec */}
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>{t('companyJobs.form.employmentType')}</Label>
          <Select value={formData.employmentType} onValueChange={(value) => handleChange("employmentType", value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('companyJobs.form.employmentTypePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {employmentTypes.filter((e: any) => e.isActive !== false).map((type: any) => (
                <SelectItem key={type.id} value={type.name}>
                  {getDisplayName(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>경력 (Experience Level)</Label>
          <Select value={formData.experienceLevel} onValueChange={(value) => handleChange("experienceLevel", value)}>
            <SelectTrigger>
              <SelectValue placeholder="경력을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.filter((e: any) => e.isActive !== false).map((level: any) => (
                <SelectItem key={level.id} value={level.name}>
                  {getDisplayName(level)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t('companyJobs.form.location')}</Label>
          <Input
            placeholder={t('companyJobs.form.locationPlaceholder')}
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>급여 (Salary)</Label>
          <Input
            placeholder="예: 2000-3000만원"
            value={formData.salary}
            onChange={(e) => handleChange("salary", e.target.value)}
          />
        </div>
        <div>
          <Label>마감일 (Deadline)</Label>
          <Input
            type="date"
            value={formData.deadline}
            onChange={(e) => handleChange("deadline", e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label>공고 설명 (Description)</Label>
        <Textarea
          placeholder="채용공고 상세 설명을 입력하세요"
          rows={4}
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
      
      <div>
        <Label>요구 기술 (Required Skills)</Label>
        <SkillsMultiSelect
          value={formData.requiredSkills}
          onChange={(skills) => handleChange("requiredSkills", skills)}
          placeholder="스킬을 선택하세요"
          allowCustom={true}
        />
        <p className="text-xs text-muted-foreground mt-1">
          마스터 스킬에서 선택하거나 커스텀 스킬을 추가할 수 있습니다.
        </p>
      </div>
      
      <div>
        <Label>지원 자격 (Eligibility / Requirements)</Label>
        <Textarea
          placeholder="지원 자격 및 요구사항을 입력하세요 (예: 5+ years of experience with React, TypeScript, and modern frontend frameworks)"
          rows={4}
          value={formData.requirements}
          onChange={(e) => handleChange("requirements", e.target.value)}
        />
      </div>
      
      <div>
        <Label>복리혜택 (Benefits)</Label>
        <BenefitsInput
          value={formData.benefits}
          onChange={(benefits) => handleChange("benefits", benefits)}
          placeholder="복리혜택을 입력하세요 (예: Health insurance, Remote Work)"
        />
        <p className="text-xs text-muted-foreground mt-1">
          일반적인 복리혜택을 선택하거나 커스텀 복리혜택을 추가할 수 있습니다.
        </p>
      </div>
      
      {/* TODO: preferred field removed - not in domain spec */}
      {/* TODO: isRemote field removed - not in domain spec */}
      
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        {onSaveDraft && (
          <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
            {t('companyJobs.form.saveDraft')}
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-purple-600">
          {isLoading ? t('common.loading') : (mode === "edit" ? t('common.save') : t('companyJobs.form.publish'))}
        </Button>
      </div>
    </form>
  );
}