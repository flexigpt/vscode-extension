import {
  Box,
  Button,
  Form,
  FormField,
  Layer,
  ResponsiveContext
} from 'grommet';
import { Add, Send } from 'grommet-icons';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';

import { ChangeEvent } from 'react';
import { IMessage } from 'spec/chat';
import { ButtonScrollToBottom } from './base/button-scroll-to-bottom';

export interface ChatPanelProps {
  id?: string;
  messages?: IMessage[];
}

export function ChatPanel({ id, messages }: ChatPanelProps) {
  const [value, setValue] = React.useState({ message: '' });
  const navigate = useNavigate();

  if (!messages) {
    messages = [];
  }

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue({ message: event.target.value });
  };

  const handleSendMessage = async () => {
    const message = value.message.trim();
    if (!message) {
      return;
    }
    console.log(message);
    setValue({ message: '' });
  };

  return (
    <Layer
      position="bottom"
      full="horizontal"
      modal={false}
      responsive={false}
      plain={true}
    >
      <Box
        flex="grow"
        direction="column"
        justify="between"
        align="center"
        fill="horizontal"
      >
        <ResponsiveContext.Consumer>
          {size => (
            <Box width={size === 'small' ? '100%' : '80%'}>
              <Form
                value={value}
                onChange={nextValue => setValue(nextValue)}
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <Box
                  flex="grow"
                  direction="row"
                  background="background"
                  align="center"
                  justify="center"
                  gap="small"
                  pad={{ horizontal: 'small', vertical: 'small' }}
                  border={[
                    {
                      color: 'border',
                      size: 'small',
                      side: 'top'
                    },
                    {
                      color: 'border',
                      size: 'small',
                      side: 'left'
                    },
                    {
                      color: 'border',
                      size: 'small',
                      side: 'right'
                    }
                  ]}
                  round={{ corner: 'top', size: 'medium' }}
                >
                  <Button
                    icon={<Add />}
                    onClick={() => navigate('/')}
                    tip="New Conversation"
                    style={{ border: '1px solid #ccc', borderRadius: '50%' }}
                  />
                  <FormField name="message" required flex>
                    <TextareaAutosize
                      name="message"
                      placeholder="Send a message..."
                      minRows={2}
                      maxRows={10}
                      onChange={handleTextChange}
                      style={{
                        backgroundColor: 'inherit',
                        color: 'inherit',
                        fontFamily: 'inherit',
                        border: '1px solid inherit',
                        borderRadius: 'inherit',
                        fontSize: 'inherit',
                        outline: 'none'
                      }}
                    />
                  </FormField>
                  <Button
                    type="submit"
                    tip="Send message"
                    icon={<Send />}
                    size="small"
                    disabled={!value.message.trim()}
                    style={{ borderRadius: '50%' }}
                  />
                </Box>
              </Form>
            </Box>
          )}
        </ResponsiveContext.Consumer>
      </Box>

      <Layer
        position="bottom-right"
        modal={false}
        responsive={false}
        plain={true}
        margin={{ bottom: 'xlarge', right: 'medium' }}
      >
        <ButtonScrollToBottom />
      </Layer>
    </Layer>
  );
}
