import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
  id: number | string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 1-indexed
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <nav aria-label="Progress" className={`w-full ${className}`}>
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li
              key={step.id}
              className={`relative flex items-center ${
                index !== steps.length - 1 ? 'w-full' : ''
              }`}
            >
              <div
                onClick={() => isComplete && onStepClick && onStepClick(stepNumber)}
                className={`flex items-center gap-3 group select-none ${
                  isComplete && onStepClick ? 'cursor-pointer' : ''
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    isComplete
                      ? 'bg-[#E2F4EC] text-[#0B6B4D] border border-transparent'
                      : isCurrent
                      ? 'bg-[#1E4FD8] text-white ring-4 ring-[#E8EEFD]'
                      : 'bg-[#F4F5F7] text-[#5B6676] border border-[#D5D9E0]'
                  }`}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : stepNumber}
                </span>

                <div className="flex flex-col">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isCurrent
                        ? 'text-[#1E4FD8]'
                        : isComplete
                        ? 'text-[#1B2430]'
                        : 'text-[#5B6676]'
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-[11px] text-[#5B6676] hidden sm:inline">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    stepNumber < currentStep ? 'bg-[#0B6B4D]' : 'bg-[#E3E6EB]'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
