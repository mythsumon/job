import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXPERIENCE_LEVELS, JOB_TYPES, SALARY_RANGES, COMPANY_SIZES } from "@/lib/types";
import type { JobFilters } from "@/lib/types";

interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function JobFilters({ 
  filters, 
  onFiltersChange, 
  onApplyFilters, 
  onClearFilters 
}: JobFiltersProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">상세 필터</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Experience Level */}
        <div>
          <h4 className="font-medium text-foreground mb-3">경력</h4>
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`exp-${level.value}`}
                  checked={filters.experience === level.value}
                  onCheckedChange={(checked) => {
                    onFiltersChange({
                      ...filters,
                      experience: checked ? level.value : undefined
                    });
                  }}
                  className="filter-checkbox"
                />
                <label
                  htmlFor={`exp-${level.value}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {level.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Job Type */}
        <div>
          <h4 className="font-medium text-foreground mb-3">고용형태</h4>
          <div className="space-y-2">
            {JOB_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={filters.type === type.value}
                  onCheckedChange={(checked) => {
                    onFiltersChange({
                      ...filters,
                      type: checked ? type.value : undefined
                    });
                  }}
                  className="filter-checkbox"
                />
                <label
                  htmlFor={`type-${type.value}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <h4 className="font-medium text-foreground mb-3">연봉</h4>
          <div className="space-y-2">
            {SALARY_RANGES.map((range, index) => (
              <div key={range.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`salary-${range.value}`}
                  checked={
                    index === 0 ? filters.salaryMax === range.value :
                    index === SALARY_RANGES.length - 1 ? filters.salaryMin === range.value :
                    filters.salaryMin === SALARY_RANGES[index - 1].value && filters.salaryMax === range.value
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (index === 0) {
                        onFiltersChange({ ...filters, salaryMin: undefined, salaryMax: range.value });
                      } else if (index === SALARY_RANGES.length - 1) {
                        onFiltersChange({ ...filters, salaryMin: range.value, salaryMax: undefined });
                      } else {
                        onFiltersChange({ 
                          ...filters, 
                          salaryMin: SALARY_RANGES[index - 1].value, 
                          salaryMax: range.value 
                        });
                      }
                    } else {
                      onFiltersChange({ ...filters, salaryMin: undefined, salaryMax: undefined });
                    }
                  }}
                  className="filter-checkbox"
                />
                <label
                  htmlFor={`salary-${range.value}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {range.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Remote Work */}
        <div>
          <h4 className="font-medium text-foreground mb-3">근무형태</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={filters.isRemote === true}
              onCheckedChange={(checked) => {
                onFiltersChange({
                  ...filters,
                  isRemote: checked ? true : undefined
                });
              }}
              className="filter-checkbox"
            />
            <label
              htmlFor="remote"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              원격근무 가능
            </label>
          </div>
        </div>

        {/* Featured Jobs */}
        <div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.isFeatured === true}
              onCheckedChange={(checked) => {
                onFiltersChange({
                  ...filters,
                  isFeatured: checked ? true : undefined
                });
              }}
              className="filter-checkbox"
            />
            <label
              htmlFor="featured"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              프리미엄 채용만 보기
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={onApplyFilters} className="w-full">
            필터 적용
          </Button>
          <Button onClick={onClearFilters} variant="outline" className="w-full">
            필터 초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
