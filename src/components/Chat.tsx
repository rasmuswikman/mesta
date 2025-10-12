'use client';

import { useChat } from '@ai-sdk/react';
import { ArrowUp, Loader2Icon, SquareIcon, XIcon } from 'lucide-react';
import { Fragment, useState } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from '@/components/ai-elements/prompt-input';
import { Response } from '@/components/ai-elements/response';
import { cn } from '@/lib/utils';

const Chat = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text) return;

    sendMessage({
      text: message.text || '',
    });

    setInput('');
  };

  return (
    <div className="relative mx-auto size-full w-full max-w-xl p-6">
      <div className={cn('flex flex-col', messages.length > 0 ? 'h-[50vh]' : '')}>
        {messages.length > 0 && (
          <Conversation className="h-full">
            <ConversationContent>
              {messages.map((message) => (
                <Message className="my-3 p-0" from={message.role} key={message.id}>
                  <MessageContent className="max-w-[90%] p-0 text-base group-[.is-user]:max-w-[80%] group-[.is-assistant]:rounded-none group-[.is-user]:rounded-[15px] group-[.is-user]:rounded-br-[2px] group-[.is-assistant]:bg-transparent group-[.is-user]:bg-amber-600 group-[.is-user]:px-6 group-[.is-user]:pt-4 group-[.is-user]:pb-4 group-[.is-user]:text-stone-50">
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <Fragment key={`${message.id}-${i}`}>
                              <Response>{part.text}</Response>
                            </Fragment>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              ))}
              {(status === 'submitted' || status === 'streaming') && <Loader />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}
        <PromptInput
          className="rounded-full bg-stone-200 p-1 [&_[data-slot=input-group]]:rounded-full [&_[data-slot=input-group]]:border-none [&_[data-slot=input-group]]:shadow-none"
          onSubmit={handleSubmit}
        >
          <PromptInputToolbar className="inset-0 rounded-full bg-white p-0">
            <PromptInputBody className="flex-grow items-center">
              <PromptInputTextarea
                className="!text-base m-0! mt-4! min-h-11 w-full border-none! p-0 pl-5 font-normal text-stone-800 placeholder:text-stone-400 placeholder:italic"
                onChange={(e) => setInput(e.target.value)}
                placeholder="Lunch?"
                rows={1}
                value={input}
              />
            </PromptInputBody>
            <PromptInputSubmit
              className="mr-2 h-12 w-12 cursor-pointer rounded-full bg-amber-600 duration-200 hover:bg-amber-700"
              disabled={!input && !status}
              status={status}
            >
              {status === 'submitted' ? (
                <Loader2Icon className="size-6 animate-spin" />
              ) : status === 'streaming' ? (
                <SquareIcon className="size-6" />
              ) : status === 'error' ? (
                <XIcon className="size-6" />
              ) : (
                <ArrowUp className="size-6" />
              )}
            </PromptInputSubmit>
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default Chat;
