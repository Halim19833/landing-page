import { useEffect, useRef, useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bold,
  Italic,
  Underline,
  List,
  Heading3,
  Type,
  Smile,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Type your content...",
  className = "",
}: RichTextEditorProps) {
  const [html, setHtml] = useState<string>(value || "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHtml(value || "");
  }, [value]);

  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const executeCommand = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtml(newHtml);
      onChange(newHtml);
    }
  };

  const insertEmoji = (emojiData: EmojiClickData) => {
    focusEditor();
    document.execCommand("insertText", false, emojiData.emoji);
    updateContent();
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Ctrl+B, Ctrl+I, etc.
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          executeCommand("bold");
          break;
        case "i":
          e.preventDefault();
          executeCommand("italic");
          break;
        case "u":
          e.preventDefault();
          executeCommand("underline");
          break;
      }
    }
  };

  const toolbarButtons = [
    {
      command: "bold",
      icon: Bold,
      title: "Bold (Ctrl+B)",
      isActive: () => document.queryCommandState("bold"),
    },
    {
      command: "italic",
      icon: Italic,
      title: "Italic (Ctrl+I)",
      isActive: () => document.queryCommandState("italic"),
    },
    {
      command: "underline",
      icon: Underline,
      title: "Underline (Ctrl+U)",
      isActive: () => document.queryCommandState("underline"),
    },
    {
      command: "insertUnorderedList",
      icon: List,
      title: "Bullet List",
      isActive: () => document.queryCommandState("insertUnorderedList"),
    },
    {
      command: "formatBlock",
      value: "h3",
      icon: Heading3,
      title: "Heading 3",
      isActive: () => document.queryCommandValue("formatBlock") === "h3",
    },
    {
      command: "formatBlock",
      value: "p",
      icon: Type,
      title: "Paragraph",
      isActive: () =>
        document.queryCommandValue("formatBlock") === "p" ||
        document.queryCommandValue("formatBlock") === "div",
    },
  ];

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        {toolbarButtons.map((button, index) => {
          const Icon = button.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              title={button.title}
              className="h-8 w-8 p-0"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus
                executeCommand(button.command, button.value);
              }}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}

        {/* Emoji Picker */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              title="Insert Emoji"
              className="h-8 w-8 p-0"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <EmojiPicker
              onEmojiClick={insertEmoji}
              width={300}
              height={400}
              previewConfig={{ showPreview: false }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[120px] p-3 text-sm focus:outline-none"
        style={{
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
        }}
        onInput={updateContent}
        onKeyDown={handleKeyDown}
        onBlur={updateContent}
        dangerouslySetInnerHTML={{ __html: html }}
        data-placeholder={placeholder}
      />

      {/* Placeholder styling */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
