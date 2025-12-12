import { useState, useRef, useEffect } from "react";
import { X, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/queryClient";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Skill {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

interface SkillsMultiSelectProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  maxSkills?: number;
  allowCustom?: boolean;
}

export function SkillsMultiSelect({ 
  value = [], 
  onChange, 
  placeholder = "스킬을 선택하세요",
  maxSkills = 20,
  allowCustom = true
}: SkillsMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch active skills from master
  const { data: masterSkills = [], isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills/active"],
    queryFn: async () => {
      return await apiGet<Skill[]>("/api/skills/active");
    },
  });

  // Get skill names
  const masterSkillNames = masterSkills.map(s => s.name);
  const selectedSkills = value;
  const availableSkills = masterSkillNames.filter(s => !selectedSkills.includes(s));

  const handleToggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      // Remove skill
      onChange(selectedSkills.filter(s => s !== skillName));
    } else {
      // Add skill
      if (selectedSkills.length < maxSkills) {
        onChange([...selectedSkills, skillName]);
      }
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    onChange(selectedSkills.filter(s => s !== skillName));
  };

  const handleAddCustomSkill = () => {
    const customSkill = customSkillInput.trim();
    if (customSkill && !selectedSkills.includes(customSkill) && selectedSkills.length < maxSkills) {
      onChange([...selectedSkills, customSkill]);
      setCustomSkillInput("");
      setShowCustomInput(false);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border border-input rounded-md bg-background">
        {selectedSkills.length === 0 ? (
          <span className="text-muted-foreground text-sm py-1">{placeholder}</span>
        ) : (
          selectedSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            스킬 선택
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4">
            <div className="mb-4">
              <h4 className="font-medium mb-2">마스터 스킬에서 선택</h4>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">로딩 중...</div>
              ) : availableSkills.length === 0 ? (
                <div className="text-sm text-muted-foreground">모든 스킬이 선택되었습니다.</div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {masterSkillNames.map((skillName) => {
                      const isSelected = selectedSkills.includes(skillName);
                      const skill = masterSkills.find(s => s.name === skillName);
                      return (
                        <div
                          key={skillName}
                          className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                          onClick={() => handleToggleSkill(skillName)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSkill(skillName)}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{skillName}</div>
                            {skill?.description && (
                              <div className="text-xs text-muted-foreground">{skill.description}</div>
                            )}
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            {allowCustom && (
              <div className="border-t pt-4">
                {!showCustomInput ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowCustomInput(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    커스텀 스킬 추가
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="새 스킬 이름 입력"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                    />
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddCustomSkill}
                        disabled={!customSkillInput.trim() || selectedSkills.length >= maxSkills}
                      >
                        추가
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCustomInput(false);
                          setCustomSkillInput("");
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedSkills.length >= maxSkills && (
              <div className="mt-2 text-xs text-muted-foreground">
                최대 {maxSkills}개까지 선택할 수 있습니다.
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

