import { Accordion, AccordionPanel, Sidebar, Text } from 'grommet';
import React from 'react';
import { ConversationList } from './sidebar-conversation-list';

export const FlexiSidebar: React.FC = () => {
  return (
    <Sidebar
      gap="large"
      direction="row"
      height={{ min: '100%' }}
      width={'medium'}
      flex={false}
    >
      <Accordion fill="horizontal">
        <AccordionPanel label="Conversations">
          <ConversationList messages={[]} />
        </AccordionPanel>
        <AccordionPanel label="Prompts">
          <Text>Prompts content goes here</Text>
          {/* Add your Prompts content */}
        </AccordionPanel>
        <AccordionPanel label="CLIs">
          <Text>CLIs content goes here</Text>
          {/* Add your CLIs content */}
        </AccordionPanel>
        <AccordionPanel label="Variables">
          <Text>Variables content goes here</Text>
          {/* Add your Variables content */}
        </AccordionPanel>
        <AccordionPanel label="Settings">
          <Text>Settings content goes here</Text>
          {/* Add your Settings content */}
        </AccordionPanel>
      </Accordion>
    </Sidebar>
  );
};
