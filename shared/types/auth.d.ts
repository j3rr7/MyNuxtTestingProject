declare module '#auth-utils' {
  interface User {
    name: string;
  }

//   interface UserSession {
//     // Add your own fields
//   }

  interface SecureSessionData {
    token: string;
    permission: string;
  }
}

export {}