import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@nextui-org/button';
import { Textarea } from '@nextui-org/input';
import { Tooltip } from '@nextui-org/tooltip';

import { IconArrowElbow, IconPlus } from '@/reactui/components/ui/icons';
import { useEnterSubmit } from '@/reactui/lib/hooks/use-enter-submit';

export function PromptForm() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { formRef, onKeyDown } = useEnterSubmit();
  const [value, setValue] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        if (!value?.trim()) {
          return;
        }
        const input = value;
        setValue('');
        //   await onSubmit(input)
      }}
      ref={formRef}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-4 sm:rounded-md sm:border sm:px-4">
        <div className="flex items-center justify-between w-full">
          <Tooltip content="New Conversation">
            <Button
              className="h-8 w-8 rounded-full bg-background p-0 mr-1"
              isIconOnly
              variant="ghost"
              size="md"
              onClick={e => {
                e.preventDefault();
                navigate('/');
              }}
            >
              <IconPlus />
            </Button>
          </Tooltip>

          <Textarea
            ref={inputRef}
            minRows={1}
            maxRows={8}
            placeholder="Send a message..."
            className="min-h-[60px] flex-grow resize-none bg-transparent p-3 focus-within:outline-none sm:text-sm"
            variant="underlined"
            onChange={e => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            value={value}
          />

          <Tooltip content="Send message">
            <Button
              className="ml-1 h-8 w-8"
              isIconOnly
              variant="flat"
              size="sm"
              isDisabled={value === ''}
              type="submit"
            >
              <IconArrowElbow />
            </Button>
          </Tooltip>
        </div>
      </div>
    </form>
  );
}
