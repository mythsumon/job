import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const convertToEmployeeSchema = z.object({
  position: z.string().min(1, "직책을 입력해주세요"),
  department: z.string().min(1, "부서를 선택해주세요"),
  employmentType: z.string().min(1, "고용 형태를 선택해주세요"),
  startDate: z.string().min(1, "입사일을 선택해주세요"),
  salary: z.string().optional(),
  notes: z.string().optional(),
});

type ConvertToEmployeeForm = z.infer<typeof convertToEmployeeSchema>;

interface ConvertToEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: {
    id: number;
    name: string;
    email?: string;
    title?: string;
  };
  onSuccess?: (data?: ConvertToEmployeeForm) => void;
}

export function ConvertToEmployeeDialog({
  open,
  onOpenChange,
  candidate,
  onSuccess,
}: ConvertToEmployeeDialogProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ConvertToEmployeeForm>({
    resolver: zodResolver(convertToEmployeeSchema),
    defaultValues: {
      position: candidate.title || "",
      department: "",
      employmentType: "full_time",
      startDate: "",
      salary: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ConvertToEmployeeForm) => {
    try {
      // In a real app, this would make an API call
      console.log("Converting candidate to employee:", {
        candidateId: candidate.id,
        ...data,
      });

      toast({
        title: "성공",
        description: `${candidate.name}님이 직원으로 전환되었습니다.`,
      });

      reset();
      onOpenChange(false);
      onSuccess?.(data);
    } catch (error) {
      toast({
        title: "오류",
        description: "직원 전환 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>직원으로 전환</DialogTitle>
          <DialogDescription>
            {candidate.name}님을 직원으로 전환합니다. 필요한 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="position">직책 *</Label>
            <Input
              id="position"
              {...register("position")}
              placeholder="예: 시니어 개발자"
            />
            {errors.position && (
              <p className="text-sm text-red-600">{errors.position.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">부서 *</Label>
              <Select
                value={watch("department")}
                onValueChange={(value) => setValue("department", value)}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="부서 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">개발팀</SelectItem>
                  <SelectItem value="design">디자인팀</SelectItem>
                  <SelectItem value="marketing">마케팅팀</SelectItem>
                  <SelectItem value="sales">영업팀</SelectItem>
                  <SelectItem value="hr">인사팀</SelectItem>
                  <SelectItem value="finance">재무팀</SelectItem>
                  <SelectItem value="operations">운영팀</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-600">
                  {errors.department.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">고용 형태 *</Label>
              <Select
                value={watch("employmentType")}
                onValueChange={(value) => setValue("employmentType", value)}
              >
                <SelectTrigger id="employmentType">
                  <SelectValue placeholder="고용 형태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">정규직</SelectItem>
                  <SelectItem value="contract">계약직</SelectItem>
                  <SelectItem value="part_time">파트타임</SelectItem>
                  <SelectItem value="intern">인턴</SelectItem>
                </SelectContent>
              </Select>
              {errors.employmentType && (
                <p className="text-sm text-red-600">
                  {errors.employmentType.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">입사일 *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">연봉 (선택사항)</Label>
              <Input
                id="salary"
                {...register("salary")}
                placeholder="예: 3,000,000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">메모 (선택사항)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="추가 정보나 메모를 입력하세요"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
              전환하기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
