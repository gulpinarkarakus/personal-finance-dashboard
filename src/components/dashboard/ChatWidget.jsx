import { useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '../../api/chat.js'

const WELCOME_MESSAGE = {
  role: 'bot',
  text: 'Merhaba! Harcamaların, gelirin ve bütçen hakkında soru sorabilirsin. Örneğin "bu ay ne kadar harcadım?"',
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, open])

  const handleSend = async (event) => {
    event.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setSending(true)

    try {
      const { reply } = await sendChatMessage(text)
      setMessages((prev) => [...prev, { role: 'bot', text: reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Bir hata oluştu, tekrar dener misin? (' + err.message + ')' },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <span>💬 Finans Asistanı</span>
            <button
              type="button"
              className="chat-close"
              onClick={() => setOpen(false)}
              aria-label="Sohbeti kapat"
            >
              ×
            </button>
          </div>

          <div className="chat-messages" ref={listRef}>
            {messages.map((message, index) => (
              <div key={index} className={`chat-bubble chat-bubble--${message.role}`}>
                {message.text.split('\n').map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            ))}
            {sending && <div className="chat-bubble chat-bubble--bot chat-bubble--typing">...</div>}
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Bir şey sor..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()}>
              Gönder
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chat-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Finans asistanını aç/kapat"
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  )
}
