'use client'

export default function Inbox() {
  const messages = ['Message 1', 'Message 2', 'Message 3'] // TODO: Fetch from Supabase

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl mb-4">Inbox</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index} className="mb-2 p-2 bg-gray-800 rounded">
            {msg}
          </li>
        ))}
      </ul>
    </div>
  )
}