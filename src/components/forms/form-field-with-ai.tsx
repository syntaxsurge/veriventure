"use client";

import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AIAssistButton } from "@/components/ui/ai-assist-button";

export type FormFieldWithAIProps = {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  type?: "text" | "email" | "url" | "number" | "textarea";
  rows?: number;
  maxLength?: number;
  onAIAssist?: () => Promise<void> | void;
  aiLabel?: string;
  disabled?: boolean;
  required?: boolean;
  children?: ReactNode;
};

export function FormFieldWithAI({
  name,
  label,
  description,
  placeholder,
  type = "text",
  rows = 4,
  maxLength,
  onAIAssist,
  aiLabel = "Use AI",
  disabled = false,
  required = false,
}: FormFieldWithAIProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between gap-4">
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
            {onAIAssist && (
              <AIAssistButton
                onAssist={onAIAssist}
                label={aiLabel}
                disabled={disabled}
              />
            )}
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            {type === "textarea" ? (
              <div className="relative">
                <Textarea
                  {...field}
                  placeholder={placeholder}
                  rows={rows}
                  maxLength={maxLength}
                  disabled={disabled}
                  className="resize-none"
                />
                {maxLength && field.value && (
                  <div className="mt-1 text-right text-xs text-muted-foreground">
                    {field.value.length} / {maxLength}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <Input
                  {...field}
                  type={type}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  disabled={disabled}
                />
                {maxLength && field.value && (
                  <div className="mt-1 text-right text-xs text-muted-foreground">
                    {field.value.length} / {maxLength}
                  </div>
                )}
              </div>
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
