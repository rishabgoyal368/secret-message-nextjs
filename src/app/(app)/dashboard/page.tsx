'use client'
import { Message } from '@/model/User';
import React, { useCallback, useEffect, useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { acceptMessagesSchema } from '@/schemas/acceptMessage';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { MessageCard } from '@/components/MessageCard';
import { Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { User } from 'next-auth';

function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { toast } = useToast();
  const handleDeleteMessage = (messageId:string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  }

  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(acceptMessagesSchema)
  })
  
  const { register, watch, setValue } = form;
  const acceptMessage = watch('acceptMessage');

  const fetchAcceptMessage = useCallback(async() => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('api/accept-messages')
      setValue('acceptMessage', response.data.isAcceptingMessage)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Something went wrong',
        variant: 'destructive',
      });
    }
    finally{
      setIsSwitchLoading(false);
    }
  },[setValue]);

  const fetchMessage = useCallback(async(refresh:boolean = false) => {
    setIsLoading(true);
    setIsSwitchLoading(false);
    try {
      const response = await axios.get<ApiResponse>('api/get-messages')
      setMessages(response.data.messages || [])
      if(refresh){
        toast({
          title: 'Refreshed',
          description: 'Showing latest messages',
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Something went wrong',
        variant: 'destructive',
      });
    }
    finally{
      setIsSwitchLoading(false);
      setIsLoading(false);
    }
  },[setIsLoading, setMessages]);

  useEffect(() => {
    if(!session || !session?.user) return ;
    fetchAcceptMessage();
    fetchMessage();


  }, [session, setValue, fetchAcceptMessage, fetchMessage])


  const handleSwitchChange = async() => {
    try {
      const response = await axios.post('/api/accept-messages', {
        acceptMessage: !acceptMessage,
      })
      setValue('acceptMessage', !acceptMessage);
      toast({
        title: response?.data?.message,
        description: response?.data?.message,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  if(!session || !session.user){
    return <div>Please login </div>
  }

  const { username } = session?.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/u/${username}`;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessage}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessage ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessage(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage