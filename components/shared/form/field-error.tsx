import { ActionState } from "@/components/shared/form/utils/to-action-state";

interface FieldErrorProps {
  actionState: ActionState;
  id?: string;
  name: string;
}

const FieldError = ({ actionState, id, name }: FieldErrorProps) => {
  const message = actionState.fieldErrors[name]?.[0];

  if (!message) return null;

  return (
    <span id={id} role="alert" className="text-red-500 text-sm -mt-2">
      {message}
    </span>
  );
};

export default FieldError;
