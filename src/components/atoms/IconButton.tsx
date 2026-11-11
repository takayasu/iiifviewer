import { Button, Tooltip, type ButtonProps } from '@fluentui/react-components';
import type { ReactElement } from 'react';

export interface IconButtonProps {
  readonly label: string;
  readonly icon: ReactElement;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly appearance?: ButtonProps['appearance'];
  readonly pressed?: boolean;
}

/** Icon-only Fluent button with tooltip and accessible name. */
export function IconButton({ label, icon, onClick, disabled, appearance = 'subtle', pressed }: IconButtonProps) {
  return (
    <Tooltip content={label} relationship="label" withArrow>
      <Button
        appearance={pressed ? 'primary' : appearance}
        icon={icon}
        onClick={onClick}
        // Stays focusable when disabled so keyboard focus is not lost (e.g. reaching the last page).
        disabledFocusable={disabled}
        aria-pressed={pressed}
      />
    </Tooltip>
  );
}
