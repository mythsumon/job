/** @format */

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface MongolianIdInputProps {
    value: string;
    onChange: (value: string) => void;
    onValidChange: (isValid: boolean) => void;
    disabled?: boolean;
}

// 키릴 문자 목록
const CYRILLIC_LETTERS = [
    "А",
    "Б",
    "В",
    "Г",
    "Д",
    "Е",
    "Ё",
    "Ж",
    "З",
    "И",
    "Й",
    "К",
    "Л",
    "М",
    "Н",
    "О",
    "Ө",
    "П",
    "Р",
    "С",
    "Т",
    "У",
    "Ү",
    "Ф",
    "Х",
    "Ц",
    "Ч",
    "Ш",
    "Щ",
    "Ъ",
    "Ы",
    "Ь",
    "Э",
    "Ю",
    "Я",
];

export default function MongolianIdInput({
    value,
    onChange,
    onValidChange,
    disabled,
}: MongolianIdInputProps) {
    const { t } = useLanguage();
    const [firstLetter, setFirstLetter] = useState("");
    const [secondLetter, setSecondLetter] = useState("");
    const [numbers, setNumbers] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [validationError, setValidationError] = useState("");
    const [isFirstLetterModalOpen, setIsFirstLetterModalOpen] = useState(false);
    const [isSecondLetterModalOpen, setIsSecondLetterModalOpen] =
        useState(false);
    const { toast } = useToast();

    // Parse existing value when component mounts
    useEffect(() => {
        if (value && value.length >= 2) {
            setFirstLetter(value[0] || "");
            setSecondLetter(value[1] || "");
            setNumbers(value.substring(2) || "");
        }
    }, []);

    // Update combined value when parts change
    useEffect(() => {
        const newValue = firstLetter + secondLetter + numbers;
        if (newValue !== value) {
            onChange(newValue);
        }
    }, [firstLetter, secondLetter, numbers]);

    // 유효성 검사 및 중복 확인
    useEffect(() => {
        const fullId = firstLetter + secondLetter + numbers;

        if (fullId.length === 10) {
            if (
                firstLetter &&
                secondLetter &&
                numbers.length === 8 &&
                /^\d{8}$/.test(numbers)
            ) {
                setValidationError("");
                checkAvailability(fullId);
            } else {
                setValidationError("유효하지 않은 형식입니다");
                setIsAvailable(null);
                onValidChange(false);
            }
        } else {
            setValidationError("");
            setIsAvailable(null);
            onValidChange(false);
        }
    }, [firstLetter, secondLetter, numbers]);

    const checkAvailability = async (mongolianId: string) => {
        setIsChecking(true);
        try {
            const response = await apiRequest(
                "POST",
                "/api/auth/check-mongolian-id",
                { mongolianId }
            );
            const data = await response.json();
            const available = data.data?.available || data.available;

            setIsAvailable(available);
            onValidChange(available);

            if (!available) {
                toast({
                    title: "주민등록번호 중복",
                    description: "이미 등록된 주민등록번호입니다.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error checking Mongolian ID:", error);
            setIsAvailable(null);
            onValidChange(false);
        } finally {
            setIsChecking(false);
        }
    };

    const handleNumbersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 8);
        setNumbers(value);
    };

    const handleFirstLetterSelect = (letter: string) => {
        setFirstLetter(letter);
        setIsFirstLetterModalOpen(false);
    };

    const handleSecondLetterSelect = (letter: string) => {
        setSecondLetter(letter);
        setIsSecondLetterModalOpen(false);
    };

    const getValidationIcon = () => {
        if (isChecking) {
            return (
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
            );
        }
        if (validationError) {
            return <X className="h-4 w-4 text-red-500" />;
        }
        if (isAvailable === true) {
            return <Check className="h-4 w-4 text-green-500" />;
        }
        if (isAvailable === false) {
            return <X className="h-4 w-4 text-red-500" />;
        }
        return null;
    };

    const CyrillicLetterModal = ({
        isOpen,
        onClose,
        onSelect,
        title,
    }: {
        isOpen: boolean;
        onClose: () => void;
        onSelect: (letter: string) => void;
        title: string;
    }) => (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-7 gap-2 p-4">
                    {CYRILLIC_LETTERS.map((letter) => (
                        <Button
                            key={letter}
                            variant="outline"
                            size="sm"
                            onClick={() => onSelect(letter)}
                            className="h-10 w-10 text-sm font-medium hover:bg-blue-50 hover:border-blue-300"
                        >
                            {letter}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="space-y-2">
            <Label>{t("register.mongolianId.label")} *</Label>

            <div className="flex items-center gap-2">
                {/* 첫 번째 키릴 문자 선택 */}
                <div className="flex flex-col items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFirstLetterModalOpen(true)}
                        disabled={disabled}
                        className="h-12 w-12 text-lg font-bold"
                    >
                        {firstLetter || "?"}
                    </Button>
                </div>

                {/* 두 번째 키릴 문자 선택 */}
                <div className="flex flex-col items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSecondLetterModalOpen(true)}
                        disabled={disabled}
                        className="h-12 w-12 text-lg font-bold"
                    >
                        {secondLetter || "?"}
                    </Button>
                </div>

                {/* 8자리 숫자 입력 */}
                <div className="flex-1">
                    <div className="flex flex-col gap-1">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder={t(
                                    "register.mongolianId.numbersPlaceholder"
                                )}
                                value={numbers}
                                onChange={handleNumbersChange}
                                className={`h-12 text-center tracking-wider ${
                                    validationError
                                        ? "border-red-500"
                                        : isAvailable === true
                                        ? "border-green-500"
                                        : ""
                                }`}
                                disabled={disabled}
                                maxLength={8}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {getValidationIcon()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 결합된 ID 미리보기 */}
            {(firstLetter || secondLetter || numbers) && (
                <div className="p-3 bg-muted rounded-lg">
                    <div className="text-lg font-mono tracking-wide">
                        <span className="text-blue-600 font-bold">
                            {firstLetter || "_"}
                        </span>
                        <span className="text-blue-600 font-bold">
                            {secondLetter || "_"}
                        </span>
                        <span className="text-green-600">
                            {numbers || "________"}
                        </span>
                    </div>
                </div>
            )}

            {/* 에러 메시지 */}
            {validationError && (
                <div className="text-xs text-red-500">{validationError}</div>
            )}

            {/* 중복 확인 결과 */}
            {isAvailable === false && (
                <div className="text-xs text-red-500">
                    이미 등록된 주민등록번호입니다.
                </div>
            )}

            {/* 키릴 문자 선택 모달들 */}
            <CyrillicLetterModal
                isOpen={isFirstLetterModalOpen}
                onClose={() => setIsFirstLetterModalOpen(false)}
                onSelect={handleFirstLetterSelect}
                title={t("register.mongolianId.modalTitle")}
            />

            <CyrillicLetterModal
                isOpen={isSecondLetterModalOpen}
                onClose={() => setIsSecondLetterModalOpen(false)}
                onSelect={handleSecondLetterSelect}
                title={t("register.mongolianId.modalTitle")}
            />
        </div>
    );
}
