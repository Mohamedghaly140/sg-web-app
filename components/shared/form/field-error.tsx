import { FieldError as FieldErrorPrimitive } from "@/components/ui/field";
import { ActionState } from "@/components/shared/form/utils/to-action-state";

export interface FieldErrorProps {
  actionState?: ActionState;
  error?: string;
  id?: string;
  name: string;
}

const FieldError = ({ actionState, error, id, name }: FieldErrorProps) => {
  const messages = [error, ...(actionState?.fieldErrors[name] ?? [])].filter(
    (message): message is string => Boolean(message),
  );

  return (
    <FieldErrorPrimitive
      id={id}
      errors={messages.map((message) => ({ message }))}
    />
  );
};

export default FieldError;
