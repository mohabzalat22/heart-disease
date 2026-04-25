'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { updateProfile, updateSystemPrompt } from '@/actions/settingsActions';
import { User, MessageSquare, Save, Loader2, Camera } from 'lucide-react';
import { AuthState } from '@/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SettingsFormProps {
  initialUser: {
    name: string;
    email: string;
    image?: string | null;
    role: 'USER' | 'ADMIN';
    tokens: number;
  };
  initialPrompt: string;
}

export function SettingsForm({
  initialUser,
  initialPrompt,
}: SettingsFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'profile';

  const [profileState, profileAction, isProfilePending] = useActionState(
    updateProfile,
    null as AuthState
  );
  const [promptState, promptAction, isPromptPending] = useActionState(
    updateSystemPrompt,
    null as AuthState
  );

  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(
    initialUser.image || null
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`/settings?${params.toString()}`);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and system preferences.
        </p>
      </div>

      <Tabs
        orientation="vertical"
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col md:flex-row gap-8"
      >
        <TabsList className="md:w-64 flex flex-col items-stretch justify-start bg-transparent h-auto">
          <TabsTrigger
            value="profile"
            className="justify-start gap-2 px-4 py-3 data-[state=active]:bg-muted"
          >
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="prompt"
            className="justify-start gap-2 px-4 py-3 data-[state=active]:bg-muted"
          >
            <MessageSquare className="h-4 w-4" />
            System Prompt
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <TabsContent value="profile" className="m-0">
            <form action={profileAction}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account&apos;s profile information and email
                    address.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <Avatar className="h-24 w-24 border">
                      <AvatarImage
                        src={avatarPreview || ''}
                        alt={initialUser.name}
                      />
                      <AvatarFallback className="text-2xl">
                        {initialUser.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Change Avatar
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        JPG, GIF or PNG. Max size of 2MB.
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <input
                      type="hidden"
                      name="image"
                      value={avatarPreview || ''}
                    />
                  </div>

                  <div className="space-y-4">
                    {initialUser.role !== 'ADMIN' && (
                      <div className="space-y-2">
                        <Label>Available Tokens</Label>
                        <Input value={String(initialUser.tokens)} disabled />
                        <p className="text-xs text-muted-foreground">
                          One token is used for each chat request.
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={initialUser.name}
                        placeholder="Your Name"
                        required
                      />
                      {profileState?.errors?.name && (
                        <p className="text-xs text-rose-500">
                          {profileState.errors.name[0]}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={initialUser.email}
                        placeholder="email@example.com"
                        required
                      />
                      {profileState?.errors?.email && (
                        <p className="text-xs text-rose-500">
                          {profileState.errors.email[0]}
                        </p>
                      )}
                    </div>
                    {profileState?.message && !profileState.errors && (
                      <p className="text-sm font-medium text-emerald-500">
                        {profileState.message}
                      </p>
                    )}
                    {profileState?.message && profileState.errors && (
                      <p className="text-sm font-medium text-rose-500">
                        {profileState.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isProfilePending}>
                    {isProfilePending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="prompt" className="m-0">
            <form action={promptAction}>
              <Card>
                <CardHeader>
                  <CardTitle>System Prompt</CardTitle>
                  <CardDescription>
                    Configure the default behavior of the AI assistant.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt Content</Label>
                    <Textarea
                      id="prompt"
                      name="prompt"
                      defaultValue={initialPrompt}
                      placeholder="You are a helpful assistant..."
                      className="min-h-[200px]"
                      required
                    />
                    {promptState?.errors?.prompt && (
                      <p className="text-xs text-rose-500">
                        {promptState.errors.prompt[0]}
                      </p>
                    )}
                  </div>
                  {promptState?.message && !promptState.errors && (
                    <p className="text-sm font-medium text-emerald-500">
                      {promptState.message}
                    </p>
                  )}
                  {promptState?.message && promptState.errors && (
                    <p className="text-sm font-medium text-rose-500">
                      {promptState.message}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isPromptPending}>
                    {isPromptPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Prompt
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
