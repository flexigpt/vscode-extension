import { Box, Button, Form, FormField, Layer } from 'grommet';
import { Add, Refresh, Send, Stop } from 'grommet-icons';
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
  const isLoading = false;

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
      <Box fill="vertical" justify="between" align="center">
        <ButtonScrollToBottom />

        <Box direction="row" justify="center" pad="small">
          {isLoading ? (
            <Button
              onClick={() => stop()}
              icon={<Stop />}
              tip={{
                content: 'Stop generating',
                dropProps: { align: { left: 'right' } }
              }}
            />
          ) : (
            messages.length > 0 && (
              <Button
                icon={<Refresh />}
                tip={{
                  content: 'Regenerate response',
                  dropProps: { align: { left: 'right' } }
                }}
              />
            )
          )}
        </Box>

        <Form
          value={value}
          onChange={nextValue => setValue(nextValue)}
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Box
            direction="row"
            background="background"
            align="center"
            gap="small"
            pad={{ horizontal: 'small', vertical: 'small' }}
            border={{ color: 'border', size: 'small' }}
            round="small"
            width="large"
            alignSelf="center"
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
    </Layer>
  );
}
