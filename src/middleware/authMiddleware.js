import { fetchOpenIDConfig } from '../controllers/authController.js'

export function isAuthenticated (req, res, next) {
  if (req.session.userinfo) {
    return next()
  }

  return res.status(401).json({ message: 'Unauthorized access' })
}

// export async function refreshAccessToken (req, res, next) {
//   try {
//     if (!req.session || !req.session.refreshToken) {
//       return res.status(401).json({ message: 'Unauthorized access' })
//     }

//     const config = await fetchOpenIDConfig()

//     const tokens = await client.refreshTokenGrant(
//       config,
//       req.session.access_token
//     )

//     req.session.userinfo.access_token = tokens.access_token
//     req.session.refreshToken = tokens.refresh_token || refreshToken

//     next()
//   } catch (error) {
//     console.error('Error refreshing access token:', error)
//     return res
//       .status(401)
//       .json({ message: 'Token refresh failed', error: error.message })
//   }
// }
