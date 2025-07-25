import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import React, { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Icon, KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { scrollbarThin } from 'theming/mixins';
import { EmptyFunction } from 'helpers/emptyFunction';
import styles from './Modal.module.less';

interface ModalProps {
  children: JSX.Element | Array<JSX.Element>;
  title: string;
  isOpen: boolean;
  showCloseButton?: boolean;
  showExpandButton?: boolean;
  onClose: VoidFunction;
  className?: string;
  modalWidth?: string;
  expanded?: boolean;
  setExpanded?: (boolean) => void;
  testId?: string;
  hideHeaderBorder?: boolean;
}
const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    min-width: 304px;
  }
`;

const Header = styled(DialogTitle)<{ hideBorder?: boolean }>(
  ({ theme, hideBorder }) => ({
    padding: '2px 4px 2px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: `${theme.ketcher.font.family.inter}`,
    fontSize: `${theme.ketcher.font.size.medium}`,
    fontWeight: 500,
    textTransform: 'capitalize',
    borderBottom: hideBorder ? 'none' : '1px solid rgba(202, 211, 221, 1)',
  }),
);

const Title = styled.div({
  marginRight: '10px',
  fontSize: '14px',
});

const StyledIcon = styled(Icon)({
  width: '16px',
  height: '16px',
  color: 'rgba(51, 51, 51, 1)',
});

const Content = styled(DialogContent)`
  padding: 0;
  font-size: ${({ theme }) => theme.ketcher.font.size.medium};
  line-height: 17px;
  color: #000000;
  ${({ theme }) => scrollbarThin(theme)};
`;

interface FooterProps {
  withborder?: string;
}

const Footer = styled(DialogActions)<FooterProps>`
  height: 52px;
  margin: 0;
  padding: 0 12px;
  border-top: ${({ theme, withborder }) =>
    withborder === 'true' ? theme.ketcher.border.small : 'none'};
  justify-content: flex-end;

  .MuiButtonBase-root {
    border-radius: 4px;
    font-size: ${({ theme }) => theme.ketcher.font.size.regular};
  }
`;

type ModalSubcomponent = 'Content' | 'Footer';

export const Modal = ({
  children,
  title,
  isOpen,
  showCloseButton = true,
  showExpandButton = false,
  onClose,
  className,
  modalWidth,
  expanded = false,
  setExpanded = EmptyFunction,
  testId,
  hideHeaderBorder,
}: ModalProps) => {
  const theme = useTheme();

  const paperProps = useMemo(
    () => ({
      testId,
      style: {
        background: theme.ketcher.color.background.primary,
        borderRadius: '8px',
        color: theme.ketcher.color.text.primary,
        ...(showExpandButton && {
          margin: 'auto',
          width: expanded ? '100%' : modalWidth,
          height: expanded ? '100%' : undefined,
          maxWidth: 'calc(min(1280px, 100%))',
          maxHeight: 'calc(min(980px, 100%))',
        }),
      },
    }),
    [
      theme.ketcher.color.text.primary,
      theme.ketcher.color.background.canvas,
      expanded,
    ],
  );

  const backdropProps = useMemo(
    () => ({
      style: {
        background: theme.ketcher.color.background.overlay,
        opacity: 0.4,
      },
    }),
    [theme.ketcher.color.background.overlay],
  );

  const subcomponents: Record<ModalSubcomponent, JSX.Element | null> = {
    Content: null,
    Footer: null,
  };

  React.Children.forEach(children, (child) => {
    if (child.type === Content) {
      subcomponents.Content = child;
    } else if (child.type === Footer) {
      subcomponents.Footer = child;
    }
  });

  return (
    <StyledDialog
      BackdropProps={backdropProps}
      PaperProps={paperProps}
      open={isOpen}
      onClose={onClose}
      container={document.querySelector(
        KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
      )}
      disableEscapeKeyDown={!showCloseButton}
      className={className}
      sx={{ padding: '24px' }}
    >
      {title || showCloseButton || showExpandButton ? (
        <Header hideBorder={hideHeaderBorder}>
          <Title>{title}</Title>
          <span>
            {showExpandButton && (
              <IconButton
                title={'expand window'}
                className={styles.expandButton}
                onClick={() => {
                  setExpanded(!expanded);
                }}
              >
                <StyledIcon name={expanded ? 'minimize-expansion' : 'expand'} />
              </IconButton>
            )}
            {showCloseButton && (
              <IconButton
                title={'Close window'}
                onClick={onClose}
                data-testid="close-window-button"
              >
                <StyledIcon name={'close'} />
              </IconButton>
            )}
          </span>
        </Header>
      ) : (
        ''
      )}

      {subcomponents.Content}

      {subcomponents.Footer}
    </StyledDialog>
  );
};

Modal.Content = Content;
Modal.Footer = Footer;
