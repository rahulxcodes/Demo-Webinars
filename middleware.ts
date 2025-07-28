import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        // Protect webinar host routes
        if (req.nextUrl.pathname.includes('/host')) {
          return !!token && (token.role === 'HOST' || token.role === 'ADMIN')
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/webinar/:path*/host']
}