import * as React from 'react';


import {IMessage as Message} from "@/spec/chat"

import { Separator } from '@/reactui/components/ui/separator'
import { ChatMessage } from '@/reactui/components/chat-message'

export interface ChatList {
  messages: Message[]
}

export function ChatList({ messages }: ChatList) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage message={message} />
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
    </div>
  )
}
