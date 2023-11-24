import * as _nextui_org_system from '@nextui-org/system';
import React, { ElementRef, forwardRef } from 'react';

import {
  Modal,
  ModalBody,
  ModalBodyProps,
  ModalContent,
  ModalContentProps,
  ModalFooter,
  ModalFooterProps,
  ModalHeader,
  ModalHeaderProps,
  ModalProps,
  useDisclosure
} from '@nextui-org/modal';
import { ModalSlots, SlotsToClasses } from '@nextui-org/theme';

import { clsx, type ClassValue } from 'clsx';
import { HTMLMotionProps } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SheetProps extends Omit<ModalProps, 'placement'> {
  placement?: 'left' | 'right';
}

export const Sheet = forwardRef<ElementRef<typeof Modal>, SheetProps>(
  ({ placement = 'left', classNames, ...props }, ref) => {
    const extendedClassNames = {
      backdrop: cn(classNames?.backdrop),
      base: cn('!m-0 h-full !rounded-none', classNames?.base),
      body: cn(classNames?.body),
      closeButton: cn(classNames?.closeButton),
      footer: cn(classNames?.footer),
      header: cn(classNames?.header),
      wrapper: cn(
        placement === 'left'
          ? '!justify-start'
          : placement === 'right'
          ? 'justify-end'
          : '',
        classNames?.wrapper
      )
    } as SlotsToClasses<ModalSlots>;

    const motionProps = {
      variants: {
        enter: {
          x: 0,
          opacity: 1,
          transition: {
            duration: 0.2,
            ease: 'easeOut'
          }
        },
        exit: {
          x: 40,
          opacity: 0,
          transition: {
            duration: 0.1,
            ease: 'easeIn'
          }
        }
      }
    } as HTMLMotionProps<'section'>;

    return (
      <Modal
        ref={ref}
        classNames={extendedClassNames}
        motionProps={motionProps}
        {...props}
      />
    );
  }
);
Sheet.displayName = 'Sheet';

type KeysToOmit = "children" | "role";
export const SheetBody: _nextui_org_system.InternalForwardRefRenderFunction<"div", ModalBodyProps, never> = ModalBody;

export const SheetContent: _nextui_org_system.InternalForwardRefRenderFunction<"div", ModalContentProps, KeysToOmit> = ModalContent;

export const SheetFooter: _nextui_org_system.InternalForwardRefRenderFunction<"footer", ModalFooterProps, never> = ModalFooter;

export const SheetHeader: _nextui_org_system.InternalForwardRefRenderFunction<"header", ModalHeaderProps, never> = ModalHeader;

export { useDisclosure };
