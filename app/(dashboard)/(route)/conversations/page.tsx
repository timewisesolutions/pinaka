'use client'
import { MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'

import Heading from '@/components/heading'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/empty'
import { Loader } from '@/components/loader'
import { UserAvatar } from '@/components/user-avatar'
import { BotAvatar } from '@/components/bot-avatar'
import { formSchema } from './constants'
import { cn } from '@/lib/utils'

type Conversation = {
  content: string
  sender: 'user' | 'bot'
}

const Conversations = () => {
  const router = useRouter()
  const [messages, setMessages] = useState<Conversation[]>([])

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  })

  const isLoading = form.formState.isSubmitting
  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: string = values.prompt
      const newMessages = [
        ...messages,
        { content: userMessage, sender: 'user' },
      ]
      const response = await axios.post('/api/conversations', {
        messages: newMessages.map((message) => message.content), // Send only message content to the server
      })
      setMessages((current) => [
        ...current,
        { content: userMessage, sender: 'user' },
        { content: response.data.kwargs.content, sender: 'bot' },
      ])
      form.reset()
    } catch (error: any) {
      console.log(error)
    } finally {
      router.refresh()
    }
  }

  return (
    <div>
      <Heading
        title="Conversations"
        description="Our cutting-edge conversation model with advanced AI"
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="my-4 grid grid-cols-8 lg:grid-cols-10 gap-2 px-2 py-4 border rounded-lg focus-within:shadow-sm w-full"
            >
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-8 lg:col-span-9">
                    <FormControl className="">
                      <Input
                        className="px-4 py-2 border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="What is the value of Pi?"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-8 lg:col-span-1 w-full"
                disabled={isLoading}
              >
                Generate
              </Button>
            </form>
          </Form>
          <div className="space-y-4 mt-4">
            {isLoading && (
              <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                <Loader />
              </div>
            )}
            {messages.length === 0 && !isLoading && (
              <div>
                <Empty label="Start a conversation" />
              </div>
            )}
            <div className="flex flex-col-reverse gap-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-8 w-full flex items-start gap-x-8 rounded-lg',
                    message.sender === 'user'
                      ? 'bg-white border border-black/10'
                      : 'bg-muted'
                  )}
                >
                  {message.sender === 'user' ? <UserAvatar /> : <BotAvatar />}
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Conversations
