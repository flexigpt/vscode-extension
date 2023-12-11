import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Form, FormField, TextArea } from 'grommet';
import { Add, Send } from 'grommet-icons';

export function PromptForm() {
  const [value, setValue] = React.useState({ message: '' });
  const navigate = useNavigate();

  return (
    <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-4 sm:rounded-md sm:border sm:px-4">
      <Button
        className="h-8 w-8 rounded-full bg-background p-0 mr-1"
        icon={<Add />}
        tip={'New Conversation'}
        size="medium"
        onClick={e => {
          e.preventDefault();
          navigate('/');
        }}
      ></Button>

      <Form
        value={value}
        onChange={nextValue => setValue(nextValue)}
        onSubmit={async e => {
          e.preventDefault();
          const message = value.message.trim();
          if (!message) {
            return;
          }
          console.log(message);
          setValue({ message: '' });
          // Your submit logic
        }}
      >
        <FormField name="message" required>
          <TextArea
            name="message"
            placeholder="Send a message..."
            resize={'vertical'}
          />
        </FormField>
        <Button
          type="submit"
          tip={'Send message'}
          icon={<Send />}
          size="small"
          disabled={value.message === ''}
        />
      </Form>
    </div>
  );
}
