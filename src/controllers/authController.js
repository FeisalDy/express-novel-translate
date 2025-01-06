import { access } from 'fs'
import prisma from '../utils/db.js'
import * as client from 'openid-client'

function saveCodeVerifierToSession (req, codeVerifier) {
  if (!req.session) throw new Error('Session not initialized')
  req.session.codeVerifier = codeVerifier
}

function getCodeVerifierFromSession (req) {
  if (!req.session || !req.session.codeVerifier) {
    throw new Error('Code verifier not found in session')
  }
  return req.session.codeVerifier
}

export async function fetchOpenIDConfig () {
  const server = new URL(
    'https://accounts.google.com/.well-known/openid-configuration'
  )
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  return client.discovery(server, clientId, clientSecret)
}

async function generatePKCEAndState (req) {
  const codeVerifier = client.randomPKCECodeVerifier()
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier)
  const state = client.randomState()

  saveCodeVerifierToSession(req, codeVerifier)

  return { codeChallenge, state }
}

function buildAuthorizationUrl (config, parameters) {
  const url = client.buildAuthorizationUrl(config, parameters)
  return url.href
}

async function fetchTokens (config, currentUrl, state, codeVerifier) {
  return client.authorizationCodeGrant(config, currentUrl, {
    idTokenExpected: true,
    expectedState: state,
    pkceCodeVerifier: codeVerifier
  })
}

async function findOrCreateUser ({ sub, email, name, picture }) {
  const existingUser = await prisma.user.findUnique({
    where: { OAuthUserID: sub }
  })

  if (!existingUser) {
    return prisma.user.create({
      data: {
        OAuthProvider: 'google',
        OAuthUserID: sub,
        email,
        username: name,
        avatar: picture
      }
    })
  }

  return existingUser
}

export async function googleAuth (req, res) {
  try {
    const config = await fetchOpenIDConfig()
    const { codeChallenge, state } = await generatePKCEAndState(req)

    const parameters = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      scope: 'openid profile email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      response_type: 'code',
      state,
      access_type: 'offline'
    }

    if (!config.serverMetadata().supportsPKCE()) {
      parameters.nonce = client.randomNonce()
    }

    const redirectTo = buildAuthorizationUrl(config, parameters)

    return res.redirect(redirectTo)
  } catch (error) {
    console.error('Error in googleAuth:', error)
    return res
      .status(500)
      .json({ message: 'Error in googleAuth', error: error.message })
  }
}

export async function googleCallback (req, res) {
  try {
    const { code, state } = req.query

    if (!code || !state) {
      throw new Error('Missing code or state in the callback URL')
    }

    const codeVerifier = getCodeVerifierFromSession(req)
    const currentUrl = new URL(
      req.protocol + '://' + req.get('host') + req.originalUrl
    )
    const config = await fetchOpenIDConfig()

    const tokens = await fetchTokens(config, currentUrl, state, codeVerifier)
    const { access_token, id_token } = tokens
    console.log('tokens:', tokens)

    const claims = tokens.claims()
    const { sub } = claims

    const userinfo = await client.fetchUserInfo(config, access_token, sub)

    const { name, email, picture } = userinfo

    const user = await findOrCreateUser({ sub, email, name, picture })

    req.session.userinfo = userinfo

    // return res.json({ message: 'Google callback successful', userinfo: user })
    return res.redirect('/')
  } catch (error) {
    console.error('Error in googleCallback:', error)
    return res
      .status(500)
      .json({ message: 'Error in googleCallback', error: error.message })
  }
}
