// API REST dos posts
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'posts'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
const validaPosts = [
  check('title', 'Titulo do post e obrigatorio').not().isEmpty(),
  check('description', 'Descricao do post').not().isEmpty(),
  check('date', 'Data do post').not().isEmpty(),
  check('location', 'Tag do local do post').not().isEmpty(),
  check('author', 'Criador do post').not().isEmpty()
]


/**********************************************
 * GET /posts/
 * Lista todos os posts
 ***  *******************************************/
router.get("/", async (req, res) => {
  try {
    db.collection(nomeCollection).find({}).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna os documentos
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * GET /posts/:id
 * Lista o post através do id
 **********************************************/
router.get("/:id", async (req, res) => {
  try {
    db.collection(nomeCollection).find({ "_id": { $eq: ObjectId(req.params.id) } }).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
}) 

/**********************************************
 * GET /posts/title/:title
 * Lista o post através de parte do seu titulo
 **********************************************/
router.get("/title/:title", async (req, res) => {
  try {
    db.collection(nomeCollection).find({ title: {$regex: req.params.title, $options: "i"} }).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * POST /posts/
 * Inclui um novo post
 **********************************************/
router.post('/', validaPosts, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(({
      errors: errors.array()
    }))
  } else {
    await db.collection(nomeCollection)
      .insertOne(req.body)
      .then(result => res.status(201).send(result)) //retorna o ID do documento inserido)
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * PUT /posts/
 * Alterar um post pelo ID
 **********************************************/
router.put('/', validaPosts, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(({
      errors: errors.array()
    }))
  } else {
    const postsInput = req.body
    await db.collection(nomeCollection)
      .updateOne({ "_id": { $eq: ObjectId(req.body._id) } }, {
        $set:
        {
          title: postsInput.title,
          description: postsInput.description,
          date: postsInput.date,
          location: postsInput.location,
          author: postsInput.author,
        }
      },
        { returnNewDocument: true })
      .then(result => res.status(202).send(result))
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * DELETE /posts/
 * Apaga um post pelo ID
 **********************************************/
router.delete('/:id', async (req, res) => {
  await db.collection(nomeCollection)
    .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
    .then(result => res.status(202).send(result))
    .catch(err => res.status(400).json(err))
})

export default router