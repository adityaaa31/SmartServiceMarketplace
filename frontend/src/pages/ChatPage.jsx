import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchConversation, fetchContacts, sendMessage, setActiveUser, addMessage } from '../redux/slices/chatSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'

const ChatPage = () => {
  const { userId } = useParams()
  const dispatch = useDispatch()
  const { conversations, contacts, activeUserId, loading } = useSelector(state => state.chat)
  const { user } = useSelector(state => state.auth)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    dispatch(fetchContacts())
  }, [dispatch])

  useEffect(() => {
    if (userId) {
      dispatch(setActiveUser(parseInt(userId)))
      dispatch(fetchConversation(parseInt(userId)))
    }
  }, [userId, dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations[activeUserId]])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim() || !activeUserId) return
    try {
      await dispatch(sendMessage({ receiverId: activeUserId, content: message })).unwrap()
      setMessage('')
    } catch (err) { console.error(err) }
  }

  const activeContact = contacts.find(c => c.id === activeUserId)
  const messages = conversations[activeUserId] || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="grid grid-cols-12 h-full">
          {/* Contacts sidebar */}
          <div className="col-span-12 md:col-span-4 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {contacts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No conversations yet</div>
              ) : (
                contacts.map(contact => (
                  <button key={contact.id}
                    onClick={() => dispatch(setActiveUser(contact.id))}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                      activeUserId === contact.id ? 'bg-blue-50' : ''
                    }`}>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">{contact.name?.[0]}</span>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{contact.name}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.role}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="col-span-12 md:col-span-8 flex flex-col">
            {activeUserId ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{activeContact?.name?.[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{activeContact?.name}</p>
                    <p className="text-xs text-gray-500">{activeContact?.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loading ? <LoadingSpinner /> : messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">No messages yet. Start the conversation!</div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.senderId === user.id
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
                  <input type="text" value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message..." className="flex-1 input-field" />
                  <button type="submit" disabled={!message.trim()} className="btn-primary px-6">Send</button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-5xl mb-4">💬</div>
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
