'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { updateGlobalPrompt } from '../../actions/adminActions';
import { toast } from 'sonner';
import { Save, Eye, Edit3, Loader2 } from 'lucide-react';

interface PromptEditorProps {
  initialPrompt: string;
}

export function PromptEditor({ initialPrompt }: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGlobalPrompt(prompt);
      toast.success('Default prompt updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update prompt');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">System Default Prompt</CardTitle>
          <CardDescription>
            This prompt will be used as the base instruction for all AI interactions.
          </CardDescription>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          size="sm"
          className="gap-2"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
            <TabsTrigger value="edit" className="gap-2">
              <Edit3 className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Enter the system prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[500px] font-mono text-sm resize-none bg-muted/20"
              />
              <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                Markdown supported
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="min-h-[500px] p-6 rounded-md border bg-muted/10 prose prose-slate dark:prose-invert max-w-none overflow-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {prompt || '*No content to preview*'}
              </ReactMarkdown>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

