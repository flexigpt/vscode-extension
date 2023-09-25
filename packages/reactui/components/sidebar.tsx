import React from 'react';

import { Accordion, AccordionItem } from '@nextui-org/accordion';
import { Button } from '@nextui-org/button';
import { IconMenu, IconFlexiGPT } from '@/reactui/components/ui/icons';
import { ChatList } from '@/reactui/components/chat-list';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  useDisclosure
} from '@/reactui/components/ui/sheet';

export function Sidebar() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button isIconOnly onPress={onOpen} variant="light">
        <IconMenu />
      </Button>
      <Sheet
        backdrop="opaque"
        placement="left"
        size="sm"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <SheetContent>
          {onClose => (
            <>
              <SheetHeader className="justify-center">
                <IconFlexiGPT className="w-8 h-8 mr-2" />
                <p className="mt-1 font-bold">FlexiGPT</p>
              </SheetHeader>
              <SheetBody>
                <Accordion variant="light">
                  <AccordionItem
                    key="1"
                    aria-label="Conversations"
                    title="Conversations"
                  >
                    <ChatList messages={[]} />
                  </AccordionItem>
                </Accordion>
                <Accordion variant="light">
                  <AccordionItem
                    key="2"
                    aria-label="Prompts"
                    title="Prompts"
                  ></AccordionItem>
                </Accordion>
                <Accordion variant="light">
                  <AccordionItem
                    key="3"
                    aria-label="CLIs"
                    title="CLIs"
                  ></AccordionItem>
                </Accordion>
                <Accordion variant="light">
                  <AccordionItem
                    key="3"
                    aria-label="Variables"
                    title="Variables"
                  ></AccordionItem>
                </Accordion>
                <Accordion variant="light">
                  <AccordionItem
                    key="4"
                    aria-label="Settings"
                    title="Settings"
                  ></AccordionItem>
                </Accordion>
              </SheetBody>
              <SheetFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
