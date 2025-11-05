// components/TypingLoader.tsx
export default function TypingLoader() {
    return (
      <div className="relative flex items-center justify-center w-full">
        {/* Blurred glass container */}
        <div className="backdrop-blur-md bg-black/40 border border-[#2b2b30] rounded-2xl px-6 py-4 flex items-center gap-3 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          {/* Dots animation */}
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2.5 h-2.5 bg-purple-300 rounded-full animate-bounce" />
          </div>
          <span className="text-sm text-gray-300 tracking-wide">Thinking...</span>
        </div>
      </div>
    );
  }
  