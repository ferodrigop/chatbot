import { Card, CardHeader } from "@/components/ui/card";
import { UIMessage } from "@ai-sdk/react";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export default function Message({ message }: { message: UIMessage }) {
  const { role, parts } = message;
  
  // Extract text content from parts
  const textContent = parts
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join('');
  
  if (role === "assistant") {
    return (
      <div className="flex flex-col gap-3 mb-6 mt-4">
        <div className="flex items-center gap-2">
          <Bot />
          <span className="font-semibold">Assistant:</span>
        </div>
        <div className="pl-8 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {textContent}
          </ReactMarkdown>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="whitespace-pre-wrap mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User size={36} />
          <div>{textContent}</div>
        </div>
      </CardHeader>
    </Card>
  );
}
