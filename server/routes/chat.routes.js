import { Router } from 'express'
import { requireAuth } from '../auth.js'
import { getChatReply } from '../chatbot.js'

const router = Router()
router.use(requireAuth)

router.post('/', (req, res) => {
  const { message } = req.body ?? {}

  if (typeof message !== 'string' || message.length > 500) {
    return res.status(400).json({ error: 'Geçerli bir mesaj girin.' })
  }

  const reply = getChatReply(req.user.sub, message)
  res.json({ reply })
})

export default router
