const fastify = require('fastify')()

// add fastify cors
fastify.register(require('fastify-cors'), {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
})

import * as fs from 'fs';
import * as dotenv from "dotenv";

const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

import { FastifyContext, FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from 'crypto';
dotenv.config();

const server = fastify

const version = 1

server.get('/v' + version + '/playing', async (request: FastifyRequest, reply: FastifyReply) => {
    return await fetchTracks()
})

server.post('/v' + version + "/lottie", async (request: FastifyRequest, reply: FastifyReply) => {
  const uuid = randomUUID()
  fs.writeFileSync("./" + request.headers.filename + uuid + ".json", JSON.stringify(request.body))
  await exec('./lottieconverter ' + "./" + request.headers.filename + uuid + ".json" + " -type gif 160x160 45 > " + "./" + request.headers.filename + uuid + ".gif")
  const fsData = fs.readFileSync("./" + request.headers.filename + uuid + ".gif")
  fs.unlinkSync("./" + request.headers.filename + uuid + ".json")
  fs.unlinkSync("./" + request.headers.filename + uuid + ".gif")
  return fsData
})

server.get('/v1-alpha.1' + '/links', async (request: FastifyRequest, reply: FastifyReply) => {
    console.log(request.url)
    const res = await fetch('https://api.song.link' + request.url)
    return res.json()
})

server.listen(8080, "::", (err: FastifyError, address: FastifyContext) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

async function fetchTracks() {
  const response = await fetch('https://api.music.apple.com/v1/me/recent/played/tracks', {
    method: 'GET',
    headers: {
        'Authorization': process.env.DEV_TOKEN!,
        'Music-User-Token': process.env.USER_TOKEN!,
        'Content-Type': 'application/json'
    }
  })
  return response.json()
}
