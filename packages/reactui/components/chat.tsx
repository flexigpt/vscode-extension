
import * as React from 'react';
import { useChat } from 'ai/react'

import {IMessage as Message} from "@/spec/chat"

import { cn } from '@/reactui/lib/utils'
import { ChatList } from '@/reactui/components/chat-list'
import { ChatPanel } from '@/reactui/components/chat-panel'
import { EmptyScreen } from '@/reactui/components/empty-screen'
import { ChatScrollAnchor } from '@/reactui/components/chat-scroll-anchor'
import { useLocalStorage } from '@/reactui/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/reactui/components/ui/dialog'
import { useState } from 'react'
import { Button } from '@/reactui/components/ui/button'
import { Input } from '@/reactui/components/ui/input'
import { toast } from 'react-hot-toast'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const messages: Message[] = []
  const isLoading = false
  const setInput = (input: string) => {}
  // const { messages, append, reload, stop, isLoading, input, setInput } =
  //   useChat({
  //     initialMessages,
  //     id,
  //     body: {
  //       id,
  //       previewToken
  //     },
  //     onResponse(response) {
  //       if (response.status === 401) {
  //         toast.error(response.statusText)
  //       }
  //     }
  //   })
  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      {/* <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      /> */}

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenAI Key</DialogTitle>
            <DialogDescription>
              If you have not obtained your OpenAI API key, you can do so by{' '}
              <a
                href="https://platform.openai.com/signup/"
                className="underline"
              >
                signing up
              </a>{' '}
              on the OpenAI website. This is only necessary for preview
              environments so that the open source community can test the app.
              The token will be saved to your browser&apos;s local storage under
              the name <code className="font-mono">ai-token</code>.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={e => setPreviewTokenInput(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setPreviewToken(previewTokenInput)
                setPreviewTokenDialog(false)
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
