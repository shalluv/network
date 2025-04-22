import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Angry, Heart } from "lucide-react";

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => Promise<void>;
};

function MessageInput({ value, onChange, onSend }: MessageInputProps) {
  const handleSend = () => {
    if (value.trim() !== "") {
      onSend(value);
      onChange("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-4 flex h-12 w-full items-center justify-between self-center rounded-full border pr-6 pl-4"
    >
      <div className="flex w-full gap-4">
        <Popover>
          <PopoverTrigger>
            <Angry />
          </PopoverTrigger>
          <PopoverContent>
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                onChange(value + emojiData.emoji);
              }}
            />
          </PopoverContent>
        </Popover>
        <input
          type="text"
          placeholder="Message..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full focus:border-0 focus:outline-none"
        />
      </div>
      {value.trim() === "" ? (
        <Heart
          className="cursor-pointer active:fill-red-500"
          onClick={() => {
            onSend("💔");
          }}
        />
      ) : (
        <p
          onClick={handleSend}
          className="cursor-pointer font-semibold text-blue-500"
        >
          send
        </p>
      )}
    </form>
  );
}

export { MessageInput };
