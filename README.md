HOW TO RUN

We used prisma postgres dev server started by: npx prisma dev
Then: npx prisma db push
The backend is in backend/index.ts. To run: bun run index.ts
Remember to set app/utils/trpc.ts to the adress of your backend server e.x "http://192.168.0.16:3000/trpc", do the same in utils/trpc.ts (outside the app folder)
Expo dev server: npx expo start
We used Expo Go, a mobile app that you can install on ypur phone via Google Store
