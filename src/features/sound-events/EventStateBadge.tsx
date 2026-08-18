import { Badge } from "../../components/Badge";
import { CheckIcon, DisableIcon, InfoIcon } from "../../components/icons/icons";
import type { EventAssignmentState } from "../../types/soundEvent";
import { useT } from "../../i18n";

interface EventStateBadgeProps {
  state: EventAssignmentState;
}

export function EventStateBadge({ state }: EventStateBadgeProps) {
  const t = useT();
  if (state === "pack") {
    return (
      <Badge variant="accent" icon={<CheckIcon size={12} />}>
        {t("event.packSound")}
      </Badge>
    );
  }
  if (state === "default") {
    return (
      <Badge variant="neutral" icon={<InfoIcon size={12} />}>
        {t("event.windowsDefault")}
      </Badge>
    );
  }
  return (
    <Badge variant="warning" icon={<DisableIcon size={12} />}>
      {t("event.disabledState")}
    </Badge>
  );
}
