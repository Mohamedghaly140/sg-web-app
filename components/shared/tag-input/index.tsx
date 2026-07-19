"use client";

import { LucidePlus, LucideX } from "lucide-react";
import { useState, type ChangeEvent, type KeyboardEvent } from "react";

import FieldError from "@/components/shared/form/field-error";
import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TagInputProps = {
  name: string;
  label: string;
  defaultValue?: string | string[];
  placeholder?: string;
  actionState?: ActionState;
};

export default function TagInput({
  name,
  label,
  defaultValue,
  placeholder = "Add a tag",
  actionState,
}: TagInputProps) {
  const [tags, setTags] = useState(() => normalizeTags(defaultValue));
  const [value, setValue] = useState("");
  const inputId = `${name}-tag-input`;

  function addTag(rawValue: string) {
    const nextTag = rawValue.trim();
    if (!nextTag) return;

    setTags((currentTags) => {
      if (currentTags.includes(nextTag)) {
        return currentTags;
      }
      return [...currentTags, nextTag];
    });
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== ",") {
      return;
    }

    event.preventDefault();
    addTag(value);
  }

  function handleAddClick() {
    addTag(value);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
  }

  function handleBlur() {
    addTag(value);
  }

  function removeTag(tag: string) {
    setTags((currentTags) =>
      currentTags.filter((currentTag) => currentTag !== tag),
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          aria-invalid={Boolean(actionState?.fieldErrors[name]?.length)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAddClick}
          aria-label={`Add ${label.toLowerCase()} tag`}
        >
          <LucidePlus aria-hidden="true" />
        </Button>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex h-7 items-center gap-1 rounded-md border bg-muted px-2 text-sm"
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
              >
                <LucideX aria-hidden="true" />
              </Button>
            </span>
          ))}
        </div>
      ) : null}

      {tags.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}

      {actionState ? <FieldError name={name} actionState={actionState} /> : null}
    </div>
  );
}

function normalizeTags(value?: string | string[]): string[] {
  if (!value) return [];

  const values = Array.isArray(value) ? value : [value];
  return Array.from(
    new Set(
      values
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );
}
