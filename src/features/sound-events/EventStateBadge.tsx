import { Badge } from "../../components/Badge";
import { CheckIcon, DisableIcon, InfoIcon } from "../../components/icons/icons";
import type { EventAssignmentState } from "../../types/soundEvent";

interface EventStateBadgeProps {
  state: EventAssignmentState;
}

export function EventStateBadge({ state }: EventStateBadgeProps) {
  if (state === "pack") {
    return (
      <Badge variant="accent" icon={<CheckIcon size={12} />}>
        Pack sound
      </Badge>
    );
  }
  if (state === "default") {
    return (
      <Badge variant="neutral" icon={<InfoIcon size={12} />}>
        Windows default
      </Badge>
    );
  }
  return (
    <Badge variant="warning" icon={<DisableIcon size={12} />}>
      Desativado
    </Badge>
  );
}
