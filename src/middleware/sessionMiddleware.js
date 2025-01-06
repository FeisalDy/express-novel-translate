import session from 'express-session'

// export const sessionMiddleware = session({
//   secret: process.env.SESSION_SECRET || 'your-secret-key',
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     maxAge: 1000 * 60 * 60 * 24
//   }
// })

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false, // Avoid saving empty sessions
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    // maxAge: 1000 * 60 * 60 * 24, // 24 hours
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours
  }
})
